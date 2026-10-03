import { BadRequestException } from '@nestjs/common';
import type { FieldError } from '../interfaces/api-error-response.interface.js';

export class ValidationFailedException extends BadRequestException {
  constructor(public readonly details: FieldError[]) {
    super({ message: 'Hay errores en el formulario. Revisa los campos marcados.', details });
  }
}
