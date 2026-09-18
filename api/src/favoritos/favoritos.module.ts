import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoritosController } from './favoritos.controller';
import { FavoritosService } from './favoritos.service';
import { Favorito } from './entities/favorito.entity';
import { Receita } from '../receitas/entities/receita.entity';
import { Treino } from '../treinos/entities/treino.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Favorito, Receita, Treino])],
  controllers: [FavoritosController],
  providers: [FavoritosService],
  exports: [FavoritosService],
})
export class FavoritosModule {}

