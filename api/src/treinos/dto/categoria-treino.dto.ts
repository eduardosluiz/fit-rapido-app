import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateCategoriaTreinoDto {
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsString()
  imagem_url?: string;

  @IsOptional()
  @IsBoolean()
  ativa?: boolean;
}

export class UpdateCategoriaTreinoDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsString()
  imagem_url?: string;

  @IsOptional()
  @IsBoolean()
  ativa?: boolean;
}

