import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { TipoFavorito } from '../entities/favorito.entity';

export class CreateFavoritoDto {
  @IsNotEmpty({ message: 'ID do item é obrigatório' })
  @IsString()
  item_id: string;

  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  @IsEnum(TipoFavorito, { message: 'Tipo deve ser "receita" ou "treino"' })
  tipo: TipoFavorito;
}

