import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsBoolean,
} from 'class-validator';

export class CreateCategoriaReceitaDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsUrl()
  @IsOptional()
  imagem_url?: string;

  @IsBoolean()
  @IsOptional()
  ativa?: boolean;
}

export class UpdateCategoriaReceitaDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsUrl()
  @IsOptional()
  imagem_url?: string;

  @IsBoolean()
  @IsOptional()
  ativa?: boolean;
}

