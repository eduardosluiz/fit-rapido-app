import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(SupabaseService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || 
                        this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      this.logger.error('SUPABASE_URL ou chaves de acesso não configuradas no .env');
      return;
    }

    // Solução para o erro do Node.js 20 sem suporte nativo a WebSocket
    const WebSocket = require('ws');
    (global as any).WebSocket = WebSocket;
    
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      realtime: { transport: WebSocket },
      // TypeScript reclama do global.WebSocket em algumas versões do SDK
      // então setamos globalmente acima e garantimos o bypass do erro
    });
    
    this.logger.log('Conectado ao cliente de armazenamento do Supabase');
  }

  async uploadFile(bucket: string, path: string, fileBuffer: Buffer, contentType: string): Promise<string> {
    if (!this.supabase) {
      this.logger.error('Cliente Supabase não inicializado. Verifique as credenciais no .env');
      throw new Error('Supabase client not initialized');
    }

    // Garantir que o contentType seja válido
    const validContentType = contentType || 'image/jpeg';

    // Forçar o bucket para minúsculo
    const targetBucket = bucket.toLowerCase(); 

    // IMPORTANTE: Node.js usa "Buffer Pool" (8KB) para arquivos pequenos via Multer.
    // O Supabase SDK (que usa node-fetch) quebra com "Invalid Content-Type" se o Buffer for agrupado no pool.
    // Para resolver isso definitivamente, alocamos um novo Buffer isolado (não-pool).
    const cleanBuffer = Buffer.alloc(fileBuffer.length);
    fileBuffer.copy(cleanBuffer);

    const { data, error } = await this.supabase.storage
      .from(targetBucket)
      .upload(path, cleanBuffer, {
        contentType: validContentType,
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      this.logger.error(`Erro no upload para o Supabase (Bucket: ${targetBucket}): ${error.message} - Code: ${error.name}`);
      throw new Error(`Supabase Upload Error: ${error.message}`);
    }

    if (!data) {
      this.logger.error(`Upload completo, mas nenhum dado retornado para ${path}`);
      throw new Error(`Supabase Upload Error: No data returned`);
    }

    // Gerar a URL pública usando o método oficial do SDK
    const { data: publicData } = this.supabase.storage
      .from(targetBucket)
      .getPublicUrl(path);

    if (!publicData?.publicUrl) {
      this.logger.error(`Falha ao gerar URL pública para ${path}`);
      throw new Error(`Supabase Public URL Error`);
    }

    this.logger.log(`Sucesso! URL: ${publicData.publicUrl}`);
    return publicData.publicUrl;
  }
}
