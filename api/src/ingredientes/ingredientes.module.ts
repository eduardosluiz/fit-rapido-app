import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientesController } from './ingredientes.controller';
import { SubstituicoesController } from './substituicoes.controller';
import { ReceitaIngredientesController } from './receita-ingredientes.controller';
import { IAController } from './ia.controller';
import { IngredientesService } from './ingredientes.service';
import { SubstituicoesService } from './substituicoes.service';
import { ReceitaIngredientesService } from './receita-ingredientes.service';
import { IAService } from './ia.service';
import { Ingrediente } from './entities/ingrediente.entity';
import { ReceitaIngrediente } from './entities/receita-ingrediente.entity';
import { SubstituicaoUsuario } from './entities/substituicao-usuario.entity';
import { IngredienteCache } from './entities/ingrediente-cache.entity';
import { ConsultaIA } from './entities/consulta-ia.entity';
import { Receita } from '../receitas/entities/receita.entity';
import { AuthModule } from '../auth/auth.module';
import { USDAService } from './usda.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ingrediente,
      ReceitaIngrediente,
      SubstituicaoUsuario,
      IngredienteCache,
      ConsultaIA,
      Receita,
    ]),
    AuthModule,
  ],
  controllers: [
    IngredientesController,
    SubstituicoesController,
    ReceitaIngredientesController,
    IAController,
  ],
  providers: [
    IngredientesService,
    SubstituicoesService,
    ReceitaIngredientesService,
    IAService,
    USDAService,
  ],
  exports: [
    IngredientesService,
    SubstituicoesService,
    ReceitaIngredientesService,
    IAService,
  ],
})
export class IngredientesModule {}

