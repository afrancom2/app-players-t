import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class SeleccionDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsInt()
  @Min(1900)
  anioInicio!: number;

  @IsOptional()
  @IsInt()
  @Min(1900)
  anioFin?: number | null;
}
