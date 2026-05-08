import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvaliacoesController } from './avaliacoes.controller';
import { AvaliacoesService } from './avaliacoes.service';
import { Avaliacao } from './entities/avaliacao.entity';
import { ReceitasModule } from '../receitas/receitas.module';
import { TreinosModule } from '../treinos/treinos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Avaliacao]),
    forwardRef(() => ReceitasModule),
    forwardRef(() => TreinosModule),
  ],
  controllers: [AvaliacoesController],
  providers: [AvaliacoesService],
  exports: [AvaliacoesService],
})
export class AvaliacoesModule {}
