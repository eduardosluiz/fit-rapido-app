import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateReceitaIngredienteDto {
  @IsUUID()
  receita_id: string;

  @IsUUID()
  @IsOptional()
  ingrediente_id?: string | null;

  @IsString()
  @IsOptional()
  ingrediente_texto?: string;

  @IsNumber()
  @Min(0)
  quantidade: number;

  @IsString()
  @IsOptional()
  unidade?: string;

  @IsNumber()
  @IsOptional()
  ordem?: number;

  @IsString()
  @IsOptional()
  observacao?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  substitutos_sugeridos?: string[];
}

export class UpdateReceitaIngredienteDto {
  @IsUUID()
  @IsOptional()
  ingrediente_id?: string | null;

  @IsString()
  @IsOptional()
  ingrediente_texto?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  quantidade?: number;

  @IsString()
  @IsOptional()
  unidade?: string;

  @IsNumber()
  @IsOptional()
  ordem?: number;

  @IsString()
  @IsOptional()
  observacao?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  substitutos_sugeridos?: string[];
}

