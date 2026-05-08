const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const BUCKET_NAME = 'treinos';

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceMP4() {
  console.log('🚀 Forçando compatibilidade MP4 para streaming...');

  const { data: files, error: listError } = await supabase.storage
    .from(BUCKET_NAME)
    .list('exercicios', { limit: 500 });

  if (listError) return console.error(listError.message);

  for (const file of files) {
    if (file.name === '.emptyFolderPlaceholder') continue;
    
    console.log(`⏳ Atualizando: ${file.name}...`);
    const path = `exercicios/${file.name}`;

    // A estratégia agora é baixar o arquivo e subir de novo com o contentType correto
    // Isso garante 100% que o Supabase e o navegador vão respeitar o novo tipo
    const { data: blob, error: downloadError } = await supabase.storage
      .from(BUCKET_NAME)
      .download(path);

    if (downloadError) {
      console.error(`   ❌ Erro download: ${downloadError.message}`);
      continue;
    }

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, blob, {
        contentType: 'video/mp4', // FORÇA MP4 independente da extensão
        upsert: true
      });

    if (uploadError) {
      console.error(`   ❌ Erro upload: ${uploadError.message}`);
    } else {
      console.log(`   ✅ Sincronizado como video/mp4`);
    }
  }
  console.log('\n✨ Todos os vídeos foram convertidos virtualmente para MP4!');
}

forceMP4();
