const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../api/.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function diagnosticar() {
    console.log('--- Diagnóstico de URLs de Vídeo ---');
    
    const { data: receitas } = await supabase.from('receitas').select('titulo, video_url');
    const totalReceitasComVideo = receitas.filter(r => r.video_url && r.video_url !== '').length;
    const amostraReceitas = receitas.filter(r => r.video_url && r.video_url !== '').slice(0, 5);

    console.log(`Total de Receitas com algo no campo video_url: ${totalReceitasComVideo}`);
    console.log('Amostra de valores em receitas.video_url:');
    console.table(amostraReceitas);

    const { data: treinos } = await supabase.from('treinos').select('titulo, video_url');
    const totalTreinosComVideo = treinos.filter(t => t.video_url && t.video_url !== '').length;
    const treinosSemSupabase = treinos.filter(t => t.video_url && t.video_url !== '' && !t.video_url.includes('supabase.co')).slice(0, 5);

    console.log(`\nTotal de Treinos com algo no campo video_url: ${totalTreinosComVideo}`);
    console.log('Amostra de treinos que NÃO são do Supabase:');
    console.table(treinosSemSupabase);
}

diagnosticar();
