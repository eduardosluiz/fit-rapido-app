import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { SupabaseService } from './src/common/supabase.service';
import * as fs from 'fs';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const s = app.get(SupabaseService);
  
  const buf = Buffer.from('hello world image data', 'utf-8');
  
  try {
    const url = await s.uploadFile('treinos', 'geral/test-image.jpg', buf, 'image/jpeg');
    console.log('UPLOAD SUCCESS:', url);
    
    const r = await fetch(url);
    console.log('FETCH STATUS:', r.status, 'LENGTH:', r.headers.get('content-length'));
    const text = await r.text();
    console.log('CONTENT:', text);
  } catch (e) {
    console.error(e);
  }
  
  await app.close();
}
run();
