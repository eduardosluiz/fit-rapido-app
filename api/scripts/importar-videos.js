const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Configurações
const INPUT_DIR = path.join(__dirname, '../importar');
const DEST_DIR = path.join(__dirname, '../uploads/videos');
const DATABASE_URL = process.env.DATABASE_URL;

async function importarVideos() {
  console.log('🚀 Iniciando importação em massa de vídeos...');
  
  if (!fs.existsSync(INPUT_DIR)) {
    console.error('❌ Pasta de entrada não encontrada:', INPUT_DIR);
    return;
  }

  if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
  }

  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados');

    const files = fs.readdirSync(INPUT_DIR).filter(file => 
      ['.mp4', '.mov', '.webm'].includes(path.extname(file).toLowerCase())
    );

    if (files.length === 0) {
      console.log('ℹ️  Nenhum vídeo encontrado na pasta de entrada.');
      return;
    }

    console.log(`📂 Encontrados ${files.length} vídeos para importar.`);

    for (const file of files) {
      const ext = path.extname(file);
      const originalName = path.basename(file, ext);
      const uniqueName = `video-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const destPath = path.join(DEST_DIR, uniqueName);
      const inputPath = path.join(INPUT_DIR, file);

      console.log(`⏳ Processando: ${file}...`);

      // 1. Mover arquivo para a pasta de uploads da API
      fs.copyFileSync(inputPath, destPath);

      // 2. Criar registro no banco de dados
      const id = uuidv4();
      const videoUrl = `/uploads/videos/${uniqueName}`;
      
      const query = `
        INSERT INTO exercicios_biblioteca (id, nome, video_url, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, NOW(), NOW())
      `;
      
      await client.query(query, [id, originalName, videoUrl]);
      
      console.log(`   ✅ Sucesso! ID: ${id}`);
    }

    console.log('\n✨ Importação concluída com sucesso!');
    console.log(`📦 Todos os vídeos foram movidos para: ${DEST_DIR}`);
    console.log('📖 Você já pode vê-los na Biblioteca de Exercícios no Admin.');

  } catch (err) {
    console.error('❌ Erro durante a importação:', err);
  } finally {
    await client.end();
  }
}

importarVideos();
