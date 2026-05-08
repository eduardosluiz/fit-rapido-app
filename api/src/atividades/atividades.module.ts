import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AtividadesController } from './atividades.controller';
import { AtividadesService } from './atividades.service';
import { Atividade } from './entities/atividade.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Atividade])],
  controllers: [AtividadesController],
  providers: [AtividadesService],
  exports: [AtividadesService],
})
export class AtividadesModule {}
