import { IsEnum, IsString, IsInt, Min, Max, IsOptional } from 'class-validator';
import { TipoAvaliacao } from '../entities/avaliacao.entity';

export class CreateAvaliacaoDto {
  @IsString()
  item_id: string;

  @IsEnum(TipoAvaliacao, { message: 'Tipo deve ser "receita" ou "treino"' })
  tipo: TipoAvaliacao;

  @IsInt()
  @Min(1)
  @Max(5)
  nota: number;

  @IsString()
  @IsOptional()
  comentario?: string;
}

export class UpdateAvaliacaoDto {
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  nota?: number;

  @IsString()
  @IsOptional()
  comentario?: string;
}
