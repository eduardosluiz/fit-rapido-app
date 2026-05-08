import { IsEnum, IsString, IsDateString, IsOptional } from 'class-validator';
import { TipoAtividade } from '../entities/atividade.entity';

export class CreateAtividadeDto {
  @IsString()
  item_id: string;

  @IsEnum(TipoAtividade, { message: 'Tipo deve ser "fiz_receita" ou "treinei_hoje"' })
  tipo: TipoAtividade;

  @IsDateString()
  @IsOptional()
  data?: string; // Se não fornecido, usa a data atual
}
