const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Configurações
const INPUT_ROOT = path.join(__dirname, '../importar');
const BUCKET_NAME = 'treinos';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Chaves do Supabase não encontradas no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.mp4', '.mov', '.webm', '.jpg', '.png', '.jpeg'].includes(ext)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });
  return arrayOfFiles;
}

async function importarVideosComCategorias() {
  console.log('🚀 Iniciando importação inteligente...');
  if (!fs.existsSync(INPUT_ROOT)) {
    console.error('❌ Pasta não encontrada:', INPUT_ROOT);
    return;
  }
  const pgClient = new Client({ connectionString: DATABASE_URL });
  try {
    await pgClient.connect();
    const allFiles = await getAllFiles(INPUT_ROOT);
    if (allFiles.length === 0) return;

    for (const filePath of allFiles) {
      const relativePath = path.relative(INPUT_ROOT, filePath);
      const pathParts = relativePath.split(path.sep);
      const categoria = pathParts.length > 1 ? pathParts[0] : 'Geral';
      const fileName = pathParts[pathParts.length - 1];
      const ext = path.extname(fileName).toLowerCase();
      const originalName = path.basename(fileName, ext);
      const uniqueName = `video-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const fileBuffer = fs.readFileSync(filePath);

      console.log(`⏳ [${categoria}] Subindo: ${originalName}...`);

      // Otimização: Forçar video/mp4 para máxima compatibilidade no streaming
      let contentType = 'video/mp4';
      if (ext === '.webm') contentType = 'video/webm';
      if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      if (ext === '.png') contentType = 'image/png';

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(`exercicios/${uniqueName}`, fileBuffer, {
          contentType: contentType,
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error(`   ❌ Erro: ${error.message}`);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);
      const id = uuidv4();
      const query = `INSERT INTO exercicios_biblioteca (id, nome, video_url, categoria, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())`;
      await pgClient.query(query, [id, originalName, publicUrl, categoria]);
      console.log(`   ✅ Sucesso!`);
    }
    console.log('\n✨ Importação concluída!');
  } catch (err) {
    console.error('❌ Erro:', err);
  } finally {
    await pgClient.end();
  }
}

importarVideosComCategorias();
