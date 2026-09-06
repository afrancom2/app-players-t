import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PalmaresItemDto {
  @Type(() => Number)
  @IsInt()
  tituloId!: number;

  @IsInt()
  @Min(1)
  cantidad!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  clubId?: number;
}
