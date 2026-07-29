import { IsString, IsOptional } from 'class-validator';

export class UpdateGlossarioDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  descricao?: string;
}
