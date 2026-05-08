import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { SupabaseService } from './src/common/supabase.service';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const s = app.get(SupabaseService);
  
  const pool = Buffer.alloc(8 * 1024 * 1024);
  pool.write('hello world raw buffer', 100);
  const fileBuffer = pool.subarray(100, 100 + 'hello world raw buffer'.length);
  
  try {
    const url = await s.uploadFile('treinos', 'geral/test-raw.jpg', fileBuffer, 'image/jpeg');
    console.log('UPLOAD SUCCESS:', url);
  } catch (e) {
    console.error('ERROR:', e.message);
  }
  
  await app.close();
}
run();
