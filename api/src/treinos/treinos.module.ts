import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreinosController } from './treinos.controller';
import { TreinosService } from './treinos.service';
import { CategoriasTreinosController } from './categorias-treinos.controller';
import { ExerciciosBibliotecaController } from './exercicios-biblioteca.controller';
import { ExerciciosCategoriasController } from './exercicios-categorias.controller';
import { TreinosModalidadesController } from './treinos-modalidades.controller';
import { CategoriasTreinosService } from './categorias-treinos.service';
import { Treino } from './entities/treino.entity';
import { CategoriaTreino } from './entities/categoria-treino.entity';
import { ExercicioBiblioteca } from './entities/exercicio-biblioteca.entity';
import { ExercicioCategoria } from './entities/exercicio-categoria.entity';
import { TreinoModalidade } from './entities/treino-modalidade.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Treino, 
      CategoriaTreino, 
      ExercicioBiblioteca, 
      ExercicioCategoria,
      TreinoModalidade
    ]),
    forwardRef(() => NotificationsModule),
    AuthModule,
  ],
  controllers: [
    TreinosController, 
    CategoriasTreinosController, 
    ExerciciosBibliotecaController,
    ExerciciosCategoriasController,
    TreinosModalidadesController
  ],
  providers: [TreinosService, CategoriasTreinosService],
  exports: [TreinosService, TypeOrmModule],
})
export class TreinosModule {}
