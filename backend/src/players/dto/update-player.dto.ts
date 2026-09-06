import { PartialType } from '@nestjs/mapped-types';
import { CreatePlayerDto } from './create-player.dto.js';

/**
 * Todos los campos son opcionales, pero cuando `trayectoria` o `palmares`
 * vienen en el payload representan el arreglo completo y nuevo, no un merge
 * parcial de entradas individuales.
 */
export class UpdatePlayerDto extends PartialType(CreatePlayerDto) {}
