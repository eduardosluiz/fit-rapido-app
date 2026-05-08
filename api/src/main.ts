import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import helmet from 'helmet';
import { SanitizePipe } from './common/pipes/sanitize.pipe';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Aumentar limites de payload para suportar grandes metadados/json
  app.use(json({ limit: '500mb' }));
  app.use(urlencoded({ limit: '500mb', extended: true }));
  
  // Segurança: Helmet para headers de segurança
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Permite imagens de outras origens
  }));
  
  // Sanitização global de inputs
  app.useGlobalPipes(new SanitizePipe());
  
  // Validação global com class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades não definidas no DTO
      forbidNonWhitelisted: true, // Retorna erro se houver propriedades não permitidas
      transform: true, // Transforma automaticamente tipos
      transformOptions: {
        enableImplicitConversion: true,
        excludeExtraneousValues: false, // Permite valores undefined
      },
      disableErrorMessages: process.env.NODE_ENV === 'production', // Esconde mensagens de erro em produção
      stopAtFirstError: false, // Não para na primeira validação para ver todos os erros
      skipMissingProperties: false, // Não pula propriedades faltando
      skipNullProperties: true, // Pula propriedades null
      skipUndefinedProperties: true, // Pula propriedades undefined
    }),
  );
  
  // Middleware para CORS em arquivos estáticos
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Servir arquivos estáticos da pasta uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  // Servir arquivos estáticos da pasta public (página de teste)
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/',
  });
  
  // Habilitar CORS com configurações robustas para produção
  const allowedOrigins = [
    'https://admin.daipohlmann.com.br',
    'http://localhost:3000',
    'http://localhost:3001'
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Se não houver origin (ex: mobile apps ou insomnia) ou se estiver na lista permitida
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.daipohlmann.com.br')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
  });
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 API rodando em http://localhost:${port}`);
  console.log(`📚 Documentação de autenticação: http://localhost:${port}/auth`);
  console.log(`📋 Endpoints disponíveis:`);
  console.log(`   POST /auth/register - Cadastrar usuário`);
  console.log(`   POST /auth/login - Fazer login`);
  console.log(`   GET /auth/profile - Perfil (requer token)`);
}
bootstrap();

