import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Estado } from '../enums/estado.enum.js';
import { Posicion } from '../enums/posicion.enum.js';
import { PalmaresItemDto } from './palmares-item.dto.js';
import { SeleccionDto } from './seleccion.dto.js';
import { TrayectoriaItemDto } from './trayectoria-item.dto.js';

export class CreatePlayerDto {
  @IsString()
  @IsNotEmpty()
  nombreCompleto!: string;

  @IsString()
  @IsNotEmpty()
  nacionalidad!: string;

  @IsDateString()
  fechaNacimiento!: string;

  @IsEnum(Posicion)
  posicion!: Posicion;

  // En los opcionales, `null` significa "vaciar el campo" al editar
  // (un campo ausente, en cambio, se deja como está).
  @IsOptional()
  @IsUrl({ require_tld: false })
  fotoUrl?: string | null;

  @IsOptional()
  @IsString()
  biografia?: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrayectoriaItemDto)
  trayectoria!: TrayectoriaItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => SeleccionDto)
  seleccion?: SeleccionDto | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PalmaresItemDto)
  palmares!: PalmaresItemDto[];

  @IsEnum(Estado)
  estado!: Estado;

  @ValidateIf((dto: CreatePlayerDto) => dto.estado === Estado.RETIRADO)
  @IsInt()
  @Min(1900)
  anioRetiro?: number | null;
}
