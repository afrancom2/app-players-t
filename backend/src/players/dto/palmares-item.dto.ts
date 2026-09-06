import { IsInt, IsMongoId, IsOptional, Min } from 'class-validator';

export class PalmaresItemDto {
  @IsMongoId()
  tituloId!: string;

  @IsInt()
  @Min(1)
  cantidad!: number;

  @IsOptional()
  @IsMongoId()
  clubId?: string;
}
