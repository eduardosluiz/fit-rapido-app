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
    }),
    // Rate Limiting - Proteção contra DDoS e abuso
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 segundo
        limit: 10, // 10 requisições por segundo
      },
      {
        name: 'medium',
        ttl: 60000, // 1 minuto
        limit: 100, // 100 requisições por minuto
      },
      {
        name: 'long',
        ttl: 900000, // 15 minutos
        limit: 1000, // 1000 requisições por 15 minutos
      },
    ]),
    // Configuração do TypeORM com PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false, // Desabilitado temporariamente - usar migrations
      migrations: ['dist/migrations/*.js'],
      migrationsRun: false, // Executar migrations manualmente
      logging: process.env.NODE_ENV === 'development',
    }),
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

