import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { SupabaseService } from './src/common/supabase.service';
import * as fs from 'fs';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const s = app.get(SupabaseService);
  
  // Criar um buffer alocado em pool (similar ao Multer)
  const pool = Buffer.alloc(8 * 1024 * 1024); // 8MB pool
  pool.write('hello world pool data', 100);
  const fileBuffer = pool.subarray(100, 100 + 'hello world pool data'.length);
  
  console.log('Buffer length:', fileBuffer.length); // 21
  console.log('Underlying buffer length:', fileBuffer.buffer.byteLength); // 8388608
  
  // Como fixar:
  const arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);
  
  try {
    const url = await s.uploadFile('treinos', 'geral/test-pool.jpg', Buffer.from(arrayBuffer), 'image/jpeg');
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
