import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ReceitasModule } from './receitas/receitas.module';
import { UploadModule } from './upload/upload.module';
import { TreinosModule } from './treinos/treinos.module';
import { FavoritosModule } from './favoritos/favoritos.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { LegalModule } from './legal/legal.module';
import { IngredientesModule } from './ingredientes/ingredientes.module';
import { AtividadesModule } from './atividades/atividades.module';
import { AvaliacoesModule } from './avaliacoes/avaliacoes.module';
import { IAModule } from './ia/ia.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? [] : '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }),
    AuthModule,
    ReceitasModule,
    UploadModule,
    TreinosModule,
    FavoritosModule,
    SubscriptionsModule,
    NotificationsModule,
    LegalModule,
    IngredientesModule,
    AtividadesModule,
    AvaliacoesModule,
    IAModule,
  ],
})
export class AppModule {}
