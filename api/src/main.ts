import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { SanitizePipe } from './common/pipes/sanitize.pipe';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.use(json({ limit: '500mb' }));
  app.use(urlencoded({ limit: '500mb', extended: true }));
  
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
  
  app.useGlobalPipes(new SanitizePipe());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  
  const port = process.env.PORT || 3001;
  const server = await app.listen(port);
  
  // Configurar timeouts do servidor para 30 minutos, permitindo uploads de arquivos grandes (vídeos de 1GB+)
  server.setTimeout(30 * 60 * 1000);
  server.keepAliveTimeout = 30 * 60 * 1000;
  server.headersTimeout = 31 * 60 * 1000;
}
bootstrap();
