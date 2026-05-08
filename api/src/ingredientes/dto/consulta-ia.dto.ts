import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateConsultaIADto {
  @IsUUID()
  @IsNotEmpty()
  receita_id: string;

  @IsString()
  @IsNotEmpty()
  pergunta: string;
}

export class ConsultaIAResponseDto {
  id: string;
  receita_id: string;
  pergunta: string;
  resposta_ia: string;
  substituicao_sugerida?: {
    ingrediente_original: string;
    ingrediente_substituto: string;
    quantidade_original: number;
    quantidade_substituto: number;
    unidade: string;
    razao: string;
  } | null;
  aplicada: boolean;
  created_at: Date;
}



