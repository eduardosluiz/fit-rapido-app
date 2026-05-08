import {
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateSubstituicaoDto {
  @IsUUID()
  receita_id: string;

  @IsUUID()
  ingrediente_original_id: string;

  @IsUUID()
  ingrediente_substituto_id: string;

  @IsNumber()
  @Min(0)
  quantidade: number;

  @IsString()
  @IsOptional()
  unidade?: string;
}

export class CalcularMacrosComSubstituicaoDto {
  @IsUUID()
  receita_id: string;

  @IsUUID()
  @IsOptional()
  usuario_id?: string; // Para buscar substituições salvas do usuário
}

