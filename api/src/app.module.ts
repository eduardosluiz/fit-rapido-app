import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
    // Configuração de variáveis de ambiente
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? [] : '.env',
      cache: true,
    }),
    // Rate Limiting - Proteção contra DDoS e abuso
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 60000,
        limit: 100,
      },
      {
        name: 'long',
        ttl: 900000,
        limit: 1000,
      },
    ]),
    // Configuração do TypeORM com PostgreSQL
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const url = process.env.DATABASE_URL || '';
        const maskedUrl = url.replace(/:([^:@]+)@/, ':****@');
        console.log(`🔌 Tentando conectar ao banco: ${maskedUrl}`);
        console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);

        return {
          type: 'postgres',
          url: process.env.DATABASE_URL,
          autoLoadEntities: true,
          synchronize: false,
          logging: process.env.NODE_ENV === 'development',
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    // Módulos da aplicação
    // Módulos da aplicação
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
  controllers: [],
  providers: [
    // Aplicar rate limiting globalmente
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

