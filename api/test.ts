import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Treino } from './src/treinos/entities/treino.entity';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const repo = app.get(getRepositoryToken(Treino));
  const t = await repo.findOne({ where: { titulo: 'Boas Vindas' } });
  console.log('IMAGEM_URL:', t?.imagem_url);
  console.log('MODALIDADE_ID:', t?.modalidade_id);
  await app.close();
}
run();
