import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { User } from '../auth/entities/user.entity';
import { Treino } from '../treinos/entities/treino.entity';
import { Receita } from '../receitas/entities/receita.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Treino, Receita])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
