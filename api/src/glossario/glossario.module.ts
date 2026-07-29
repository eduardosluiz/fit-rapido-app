import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlossarioService } from './glossario.service';
import { GlossarioController } from './glossario.controller';
import { GlossarioIngrediente } from './entities/glossario-ingrediente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GlossarioIngrediente])],
  controllers: [GlossarioController],
  providers: [GlossarioService],
  exports: [GlossarioService],
})
export class GlossarioModule {}
