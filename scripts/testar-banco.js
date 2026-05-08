const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../api/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testarConexao() {
    console.log('--- Testando dados do banco ---');
    
    const { data, error } = await supabase
        .from('receitas')
        .select('titulo, imagem_url, video_url')
        .not('imagem_url', 'is', null)
        .limit(5);

    if (error) {
        console.error('Erro:', error);
        return;
    }

    console.log('Amostra de Receitas com Imagem:');
    console.table(data);

    const { data: treinos, error: error2 } = await supabase
        .from('treinos')
        .select('titulo, video_url')
        .not('video_url', 'is', null)
        .limit(5);

    if (error2) {
        console.error('Erro Treinos:', error2);
        return;
    }

    console.log('\nAmostra de Treinos com Vídeo:');
    console.table(treinos);
}

testarConexao();
