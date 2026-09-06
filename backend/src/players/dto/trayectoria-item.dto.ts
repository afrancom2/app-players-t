import { IsInt, IsMongoId, IsOptional, Min } from 'class-validator';

export class TrayectoriaItemDto {
  @IsMongoId()
  clubId!: string;

  @IsInt()
  @Min(1900)
  anioInicio!: number;

  @IsOptional()
  @IsInt()
  @Min(1900)
  anioFin?: number;
}
