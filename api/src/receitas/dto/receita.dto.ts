import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsUrl,
  IsEnum,
  IsInt,
  Min,
  IsBoolean,
  IsNumber,
  ValidateIf,
  IsObject,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { DificuldadeReceita, TipoRefeicao } from '../entities/receita.entity';
import { IsUrlIfPresent } from './validators/is-url-if-present.validator';

export class CreateReceitaDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsArray()
  @IsString({ each: true })
  ingredientes: string[];

  @IsObject()
  @IsOptional()
  substituicoes_ingredientes?: Record<string, string | string[]>;

  @IsArray()
  @IsString({ each: true })
  modo_preparo: string[];

  @IsString()
  @IsOptional()
  informacoes_nutricionais?: string;

  @IsString()
  @IsOptional()
  aviso_nutricional?: string;

  @Transform(({ value }) => {
    if (value === '' || value === null) return undefined;
    return value;
  })
  @IsUrlIfPresent({ message: 'imagem_url must be a URL address' })
  @IsOptional()
  imagem_url?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imagens_url?: string[];

  @Transform(({ value }) => {
    if (value === '' || value === null) return undefined;
    return value;
  })
  @IsUrlIfPresent({ message: 'video_url must be a URL address' })
  @IsOptional()
  video_url?: string;

  @Transform(({ value }) => {
    if (value === '' || value === null) return undefined;
    return value;
  })
  @IsUrlIfPresent({ message: 'video_thumbnail_url must be a URL address' })
  @IsOptional()
  video_thumbnail_url?: string;

  @Transform(({ value }) => {
    if (value === '' || value === null) return undefined;
    return value;
  })
  @IsUrlIfPresent({ message: 'ebook_url must be a URL address' })
  @IsOptional()
  ebook_url?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoria_ids?: string[];

  @IsEnum(DificuldadeReceita)
  @IsOptional()
  dificuldade?: DificuldadeReceita;

  @IsInt()
  @Min(0)
  @IsOptional()
  tempo_preparo?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  porcoes?: number;

  @IsBoolean()
  @IsOptional()
  is_premium?: boolean;

  @IsBoolean()
  @IsOptional()
  is_inedito?: boolean;

  @IsBoolean()
  @IsOptional()
  is_free?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsEnum(TipoRefeicao)
  @IsOptional()
  tipo_refeicao?: TipoRefeicao;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  cuisines?: string[];

  @IsString()
  @IsOptional()
  dica?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  calorias?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  proteinas?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  carboidratos?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  gorduras?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  fibras?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  sodio?: number;

  @IsBoolean()
  @IsOptional()
  ativa?: boolean;
}

export class UpdateReceitaDto {
  @IsString()
  @IsOptional()
  titulo?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ingredientes?: string[];

  @IsObject()
  @IsOptional()
  substituicoes_ingredientes?: Record<string, string | string[]>;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  modo_preparo?: string[];

  @IsString()
  @IsOptional()
  informacoes_nutricionais?: string;

  @IsString()
  @IsOptional()
  aviso_nutricional?: string;

  @IsString()
  @IsOptional()
  dica?: string;

  @Transform(({ value }) => {
    if (value === '' || value === null) return undefined;
    return value;
  })
  @IsUrlIfPresent({ message: 'imagem_url must be a URL address' })
  @IsOptional()
  imagem_url?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imagens_url?: string[];

  @Transform(({ value }) => {
    if (value === '' || value === null) return undefined;
    return value;
  })
  @IsUrlIfPresent({ message: 'video_url must be a URL address' })
  @IsOptional()
  video_url?: string;

  @Transform(({ value }) => {
    if (value === '' || value === null) return undefined;
    return value;
  })
  @IsUrlIfPresent({ message: 'video_thumbnail_url must be a URL address' })
  @IsOptional()
  video_thumbnail_url?: string;

  @Transform(({ value }) => {
    if (value === '' || value === null) return undefined;
    return value;
  })
  @IsUrlIfPresent({ message: 'ebook_url must be a URL address' })
  @IsOptional()
  ebook_url?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoria_ids?: string[];

  @IsEnum(DificuldadeReceita)
  @IsOptional()
  dificuldade?: DificuldadeReceita;

  @IsInt()
  @Min(0)
  @IsOptional()
  tempo_preparo?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  porcoes?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  calorias?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  proteinas?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  carboidratos?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  gorduras?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  fibras?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  sodio?: number;

  @IsBoolean()
  @IsOptional()
  is_premium?: boolean;

  @IsBoolean()
  @IsOptional()
  is_inedito?: boolean;

  @IsBoolean()
  @IsOptional()
  is_free?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsEnum(TipoRefeicao)
  @IsOptional()
  tipo_refeicao?: TipoRefeicao;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  cuisines?: string[];

  @IsBoolean()
  @IsOptional()
  ativa?: boolean;
}

