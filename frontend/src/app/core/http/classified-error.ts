import type { HttpErrorResponse } from '@angular/common/http';

export type ErrorSource = 'frontend' | 'backend' | 'database' | 'validation' | 'auth';

export interface FieldError {
  field: string;
  message: string;
}

export interface ClassifiedError {
  source: ErrorSource;
  title: string;
  message: string;
  detail?: string;
  fieldErrors?: FieldError[];
  status: number;
}

interface ApiErrorBody {
  success: false;
  error: {
    source: Exclude<ErrorSource, 'frontend'>;
    code: string;
    message: string;
    details?: FieldError[];
    path: string;
    timestamp: string;
  };
}

const SOURCE_TITLES: Record<ErrorSource, string> = {
  frontend: 'Conexión',
  backend: 'Servidor',
  database: 'Base de datos',
  validation: 'Validación',
  auth: 'Sesión y permisos',
};

function isApiErrorBody(body: unknown): body is ApiErrorBody {
  return (
    !!body &&
    typeof body === 'object' &&
    (body as { success?: unknown }).success === false &&
    typeof (body as { error?: unknown }).error === 'object'
  );
}

/**
 * Traduce un HttpErrorResponse crudo de Angular a un objeto claro que indica
 * de dónde vino la falla (frontend/conexión, backend, base de datos,
 * validación o sesión) con un mensaje humano y, si aplica, un detalle técnico
 * para quien quiera profundizar.
 */
export function classifyHttpError(err: HttpErrorResponse): ClassifiedError {
  // status 0: la petición nunca llegó a recibir respuesta (backend caído,
  // sin red, CORS bloqueado). No es culpa del backend ni de la BD.
  if (err.status === 0) {
    return {
      source: 'frontend',
      title: SOURCE_TITLES.frontend,
      message: 'No se pudo conectar con el servidor. Verifica tu conexión o que el backend esté encendido.',
      detail: err.message,
      status: 0,
    };
  }

  if (isApiErrorBody(err.error)) {
    const { error } = err.error;
    const detail =
      error.source === 'validation' && error.details?.length
        ? error.details.map((d) => `${d.field}: ${d.message}`).join('\n')
        : `Código: ${error.code} · HTTP ${err.status} · ${error.path}`;

    return {
      source: error.source,
      title: SOURCE_TITLES[error.source],
      message: error.message,
      detail,
      fieldErrors: error.details,
      status: err.status,
    };
  }

  // El backend respondió pero no con nuestro formato (ej. un proxy, un 502
  // de nginx, o un error no capturado por el filtro global).
  return {
    source: 'backend',
    title: SOURCE_TITLES.backend,
    message: 'El servidor respondió con un error inesperado.',
    detail: `HTTP ${err.status} ${err.statusText}`,
    status: err.status,
  };
}
