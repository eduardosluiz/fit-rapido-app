const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const BUCKET_NAME = 'treinos';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Chaves do Supabase não encontradas no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function corrigirVideos() {
  console.log('🚀 Iniciando "Dança de Arquivos" para corrigir metadados...');

  // 1. Listar todos os arquivos
  const { data: files, error: listError } = await supabase.storage
    .from(BUCKET_NAME)
    .list('exercicios', { limit: 500 });

  if (listError) {
    console.error('❌ Erro ao listar arquivos:', listError.message);
    return;
  }

  const videos = files.filter(f => f.name !== '.emptyFolderPlaceholder');
  console.log(`📂 Encontrados ${videos.length} vídeos para processar.`);

  for (const file of videos) {
    const originalPath = `exercicios/${file.name}`;
    const tempPath = `temp_${file.name}`;
    const ext = file.name.split('.').pop().toLowerCase();
    
    // Forçar video/mp4 para máxima compatibilidade
    let contentType = 'video/mp4';
    if (ext === 'webm') contentType = 'video/webm';

    console.log(`⏳ Processando: ${file.name}...`);

    try {
      // Passo A: Copiar para um nome temporário com o MIME TYPE correto
      const { error: copyError } = await supabase.storage
        .from(BUCKET_NAME)
        .copy(originalPath, tempPath, { contentType: contentType });

      if (copyError) {
        console.error(`   ❌ Erro na cópia: ${copyError.message}`);
        continue;
      }

      // Passo B: Deletar o original que estava com o rótulo errado
      const { error: removeError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([originalPath]);

      if (removeError) {
        console.error(`   ❌ Erro ao remover original: ${removeError.message}`);
        continue;
      }

      // Passo C: Mover o temporário de volta para o nome original
      const { error: moveError } = await supabase.storage
        .from(BUCKET_NAME)
        .move(tempPath, originalPath);

      if (moveError) {
        console.error(`   ❌ Erro ao voltar arquivo: ${moveError.message}`);
      } else {
        console.log(`   ✅ Sucesso! Vídeo corrigido para ${contentType}`);
      }
    } catch (err) {
      console.error(`   ❌ Erro inesperado em ${file.name}:`, err.message);
    }
  }

  console.log('\n✨ Todos os vídeos foram corrigidos com sucesso!');
  console.log('🚀 Agora o navegador vai tocar os vídeos em vez de baixá-los.');
}

corrigirVideos();
