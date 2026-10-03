import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { ValidationFailedException } from '../exceptions/validation-failed.exception.js';
import type { ApiErrorResponse, ErrorSource, FieldError } from '../interfaces/api-error-response.interface.js';

// Mensajes por defecto de Nest ("Unauthorized", "Forbidden resource", etc.)
// no dicen nada útil a un usuario final; los reemplazamos por algo claro.
const GENERIC_MESSAGE_OVERRIDES: Record<string, string> = {
  Unauthorized: 'Tu sesión no es válida o ha expirado. Inicia sesión nuevamente.',
  'Forbidden resource': 'No tienes permisos para realizar esta acción.',
  Forbidden: 'No tienes permisos para realizar esta acción.',
  'Not Found': 'El recurso solicitado no existe.',
  'Internal Server Error': 'Ocurrió un error inesperado en el servidor.',
};

// Códigos de error de Postgres que vale la pena traducir a un mensaje
// humano. El resto cae en el mensaje genérico de "error de base de datos".
const POSTGRES_ERROR_MAP: Record<string, { status: number; code: string; message: string }> = {
  '23505': {
    status: HttpStatus.CONFLICT,
    code: 'DUPLICATE_ENTRY',
    message: 'Ya existe un registro con esos datos.',
  },
  '23503': {
    status: HttpStatus.CONFLICT,
    code: 'FOREIGN_KEY_VIOLATION',
    message:
      'No se pudo completar la operación porque hace referencia a un dato relacionado que no existe (por ejemplo, un club, liga o título inválido).',
  },
  '23502': {
    status: HttpStatus.BAD_REQUEST,
    code: 'NOT_NULL_VIOLATION',
    message: 'Falta un dato obligatorio para completar la operación.',
  },
};

interface Classified {
  status: number;
  source: ErrorSource;
  code: string;
  message: string;
  details?: FieldError[];
  logLevel: 'warn' | 'error';
  logMessage: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const classified = this.classify(exception);

    const logLine = `${request.method} ${request.url} -> ${classified.status} [${classified.source}/${classified.code}] ${classified.logMessage}`;
    if (classified.logLevel === 'error') {
      this.logger.error(logLine, exception instanceof Error ? exception.stack : undefined);
    } else {
      this.logger.warn(logLine);
    }

    const body: ApiErrorResponse = {
      success: false,
      error: {
        source: classified.source,
        code: classified.code,
        message: classified.message,
        details: classified.details,
        path: request.url,
        timestamp: new Date().toISOString(),
      },
    };

    response.status(classified.status).json(body);
  }

  private classify(exception: unknown): Classified {
    if (exception instanceof ValidationFailedException) {
      const body = exception.getResponse() as { message: string; details: FieldError[] };
      return {
        status: HttpStatus.BAD_REQUEST,
        source: 'validation',
        code: 'VALIDATION_ERROR',
        message: body.message,
        details: body.details,
        logLevel: 'warn',
        logMessage: `${body.details.length} campo(s) inválido(s)`,
      };
    }

    if (exception instanceof HttpException) {
      return this.classifyHttpException(exception);
    }

    if (exception instanceof QueryFailedError) {
      return this.classifyDatabaseError(exception);
    }

    if (this.isConnectionRefused(exception)) {
      return {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        source: 'database',
        code: 'DATABASE_UNAVAILABLE',
        message: 'No se pudo conectar con la base de datos. Verifica que el servicio esté disponible.',
        logLevel: 'error',
        logMessage: exception instanceof Error ? exception.message : 'Conexión a la base de datos rechazada',
      };
    }

    const err = exception instanceof Error ? exception : new Error('Error desconocido');
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      source: 'backend',
      code: 'INTERNAL_ERROR',
      message: 'Ocurrió un error inesperado en el servidor.',
      logLevel: 'error',
      logMessage: err.message,
    };
  }

  private classifyHttpException(exception: HttpException): Classified {
    const status = exception.getStatus();
    const rawMessage = exception.message;
    const message = GENERIC_MESSAGE_OVERRIDES[rawMessage] ?? rawMessage;

    let source: ErrorSource = 'backend';
    let code = `HTTP_${status}`;

    if (status === HttpStatus.BAD_REQUEST) {
      // Un 400 sin ser nuestra ValidationFailedException también se trata
      // como error de validación (ej. ParseIntPipe fallando en un :id).
      source = 'validation';
      code = 'BAD_REQUEST';
    } else if (status === HttpStatus.UNAUTHORIZED || status === HttpStatus.FORBIDDEN) {
      source = 'auth';
      code = status === HttpStatus.UNAUTHORIZED ? 'UNAUTHORIZED' : 'FORBIDDEN';
    } else if (status === HttpStatus.NOT_FOUND) {
      code = 'NOT_FOUND';
    } else if (status === HttpStatus.CONFLICT) {
      code = 'CONFLICT';
    }

    return {
      status,
      source,
      code,
      message,
      logLevel: status >= 500 ? 'error' : 'warn',
      logMessage: rawMessage,
    };
  }

  private classifyDatabaseError(exception: QueryFailedError): Classified {
    const driverCode: string | undefined = (exception as unknown as { code?: string }).code;
    const mapped = driverCode ? POSTGRES_ERROR_MAP[driverCode] : undefined;

    if (mapped) {
      return {
        status: mapped.status,
        source: 'database',
        code: mapped.code,
        message: mapped.message,
        logLevel: 'warn',
        logMessage: exception.message,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      source: 'database',
      code: 'DATABASE_QUERY_ERROR',
      message: 'Ocurrió un error al consultar la base de datos.',
      logLevel: 'error',
      logMessage: exception.message,
    };
  }

  private static readonly CONNECTION_ERROR_CODES = new Set([
    'ECONNREFUSED',
    'ENOTFOUND',
    'EHOSTUNREACH',
    'ECONNRESET',
    'ETIMEDOUT',
    '08001', // sqlclient_unable_to_establish_sqlconnection
    '08006', // connection_failure
  ]);

  private isConnectionRefused(exception: unknown): boolean {
    const code = (exception as { code?: string } | undefined)?.code;
    return !!code && GlobalExceptionFilter.CONNECTION_ERROR_CODES.has(code);
  }
}
