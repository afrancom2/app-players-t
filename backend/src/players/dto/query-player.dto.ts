import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Estado } from '../enums/estado.enum.js';
import { Posicion } from '../enums/posicion.enum.js';

export class QueryPlayerDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(Posicion)
  posicion?: Posicion;

  @IsOptional()
  @IsEnum(Estado)
  estado?: Estado;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  liga?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  equipo?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 20;
}
