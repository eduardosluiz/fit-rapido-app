import { IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';

export class CreateTreinoModalidadeDto {
  @IsString()
  nome: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  imagem_url?: string;

  @IsString()
  @IsOptional()
  icone?: string;

  @IsNumber()
  @IsOptional()
  ordem?: number;

  @IsBoolean()
  @IsOptional()
  tem_nivelamento?: boolean;

  @IsString()
  @IsOptional()
  descricao_iniciante?: string;

  @IsString()
  @IsOptional()
  descricao_intermediario?: string;

  @IsString()
  @IsOptional()
  descricao_avancado?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}

export class UpdateTreinoModalidadeDto extends CreateTreinoModalidadeDto {}
