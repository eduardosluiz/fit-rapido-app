const fs = require('fs');
const path = require('path');

// Carregar módulos da pasta api/node_modules
const apiNodeModules = path.join(__dirname, '../api/node_modules');
if (fs.existsSync(apiNodeModules)) {
    module.paths.push(apiNodeModules);
}

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '../api/.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const logRenomeacao = JSON.parse(fs.readFileSync(path.join(__dirname, '../docs/log_renomeacao_midias.json'), 'utf8'));
const mapaNomes = {};
logRenomeacao.forEach(item => { mapaNomes[item.original] = item.novo; });

const URL_BASE_STORAGE = `${process.env.SUPABASE_URL}/storage/v1/object/public/treinos/`;

async function migrarExerciciosDetalhados() {
    console.log('--- FORÇANDO migração de Exercícios Detalhados (JSON) ---');
    
    const { data: treinos, error } = await supabase
        .from('treinos')
        .select('id, titulo, exercicios_detalhados')
        .not('exercicios_detalhados', 'is', null);

    if (error) {
        console.error('Erro ao buscar treinos:', error);
        return;
    }

    let totalAtualizados = 0;

    for (const treino of treinos) {
        const exercicios = treino.exercicios_detalhados;
        if (!Array.isArray(exercicios) || exercicios.length === 0) continue;

        const novosExercicios = exercicios.map(ex => {
            let novoEx = { ...ex };

            // Se tiver vídeo, vamos garantir que a URL seja a do Supabase com o nome limpo
            if (ex.video_url) {
                const nomeArquivo = path.basename(ex.video_url);
                const nomeLimpo = mapaNomes[nomeArquivo] || nomeArquivo;
                novoEx.video_url = `${URL_BASE_STORAGE}exercicios/${nomeLimpo}`;
            }

            // Se tiver imagem, vamos garantir que a URL seja a do Supabase com o nome limpo
            if (ex.imagem_url) {
                const nomeArquivo = path.basename(ex.imagem_url);
                const nomeLimpo = mapaNomes[nomeArquivo] || nomeArquivo;
                novoEx.imagem_url = `${URL_BASE_STORAGE}modalidades/${nomeLimpo}`;
            }

            return novoEx;
        });

        const { error: updateError } = await supabase
            .from('treinos')
            .update({ exercicios_detalhados: novosExercicios })
            .eq('id', treino.id);

        if (updateError) {
            console.error(`❌ Erro em [${treino.titulo}]:`, updateError);
        } else {
            console.log(`✅ [${treino.titulo}] Todos os exercícios internos foram sincronizados.`);
            totalAtualizados++;
        }
    }

    console.log(`\n🚀 SUCESSO: ${totalAtualizados} modalidades/trilhas sincronizadas com o Supabase.`);
}

migrarExerciciosDetalhados();
