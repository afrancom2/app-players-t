import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class TrayectoriaItemDto {
  @Type(() => Number)
  @IsInt()
  clubId!: number;

  @IsInt()
  @Min(1900)
  anioInicio!: number;

  @IsOptional()
  @IsInt()
  @Min(1900)
  anioFin?: number;
}
