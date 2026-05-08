import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  IsEnum,
  Min,
} from 'class-validator';
import { FonteIngrediente } from '../entities/ingrediente.entity';

export class CreateIngredienteDto {
  @IsString()
  nome: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  nome_variacoes?: string[];

  @IsString()
  @IsOptional()
  unidade_base?: string;

  @IsNumber()
  @Min(0)
  calorias: number;

  @IsNumber()
  @Min(0)
  proteinas: number;

  @IsNumber()
  @Min(0)
  carboidratos: number;

  @IsNumber()
  @Min(0)
  gorduras: number;

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
  ativo?: boolean;

  @IsEnum(FonteIngrediente)
  @IsOptional()
  fonte?: FonteIngrediente;
}

export class UpdateIngredienteDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  nome_variacoes?: string[];

  @IsString()
  @IsOptional()
  unidade_base?: string;

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
  ativo?: boolean;

  @IsEnum(FonteIngrediente)
  @IsOptional()
  fonte?: FonteIngrediente;
}

