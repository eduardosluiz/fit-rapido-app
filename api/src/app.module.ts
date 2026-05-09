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
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        // EM PRODUÇÃO: Usamos o IP direto mas avisamos ao SSL qual é o domínio (SNI)
        const isProd = process.env.NODE_ENV === 'production';
        const HOST_PROD = '54.94.90.106'; // IP AWS SP (Supabase)
        const DOMAIN_PROD = 'db.occddouiyqvcdhtxpbej.supabase.co';

        return {
          type: 'postgres',
          // Se for produção, usa IP, se não, usa a variável normal
          host: isProd ? HOST_PROD : undefined, 
          url: isProd ? undefined : process.env.DATABASE_URL,
          // Credenciais explícitas para produção
          username: isProd ? 'postgres' : undefined,
          password: isProd ? 'Fitrapido248622' : undefined,
          port: 5432,
          database: 'postgres',
          autoLoadEntities: true,
          synchronize: false,
          ssl: isProd ? { 
            rejectUnauthorized: false,
            servername: DOMAIN_PROD // ESSENCIAL: Resolve o erro de Tenant not found
          } : false,
        };
      },
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
