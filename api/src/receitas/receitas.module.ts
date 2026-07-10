import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceitasController } from './receitas.controller';
import { CategoriasReceitasController } from './categorias-receitas.controller';
import { ReceitasService } from './receitas.service';
import { CategoriasReceitasService } from './categorias-receitas.service';
import { MacrosService } from './macros.service';
import { Receita } from './entities/receita.entity';
import { CategoriaReceita } from './entities/categoria-receita.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthModule } from '../auth/auth.module';
import { IAModule } from '../ia/ia.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Receita, CategoriaReceita]),
    forwardRef(() => NotificationsModule),
    forwardRef(() => IAModule),
    AuthModule,
  ],
  controllers: [ReceitasController, CategoriasReceitasController],
  providers: [ReceitasService, CategoriasReceitasService, MacrosService],
  exports: [ReceitasService, CategoriasReceitasService, MacrosService, TypeOrmModule],
})
export class ReceitasModule {}

