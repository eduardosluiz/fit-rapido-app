const fs = require('fs');
const path = require('path');

// Tentar carregar módulos da pasta api/node_modules se não estiverem na raiz
const apiNodeModules = path.join(__dirname, '../api/node_modules');
if (fs.existsSync(apiNodeModules)) {
    module.paths.push(apiNodeModules);
}

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '../api/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const logRenomeacao = JSON.parse(fs.readFileSync(path.join(__dirname, '../docs/log_renomeacao_midias.json'), 'utf8'));

// Mapa de "De: NomeOriginal -> Para: NomeNovo"
const mapaNomes = {};
logRenomeacao.forEach(item => {
    mapaNomes[item.original] = item.novo;
});

const URL_BASE_STORAGE = `${supabaseUrl}/storage/v1/object/public/treinos/`;

async function migrarTabela(tabela, colunaUrl, subpastaBucket) {
    console.log(`\n--- Migrando tabela: ${tabela} (Coluna: ${colunaUrl}) ---`);
    
    const { data: itens, error } = await supabase
        .from(tabela)
        .select(`id, ${colunaUrl}, titulo`);

    if (error) {
        console.error(`Erro ao buscar dados da tabela ${tabela}:`, error);
        return;
    }

    let atualizados = 0;

    for (const item of itens) {
        let urlOriginal = item[colunaUrl];
        
        // Se a URL for nula ou vazia, ignoramos
        if (!urlOriginal || urlOriginal === '') continue;

        // Se for uma URL do Supabase, ignoramos
        if (urlOriginal.includes('supabase.co')) continue;

        // Se for localhost OU se não começar com http
        // OU se for apenas um nome de arquivo (comum em importações)
        const nomeArquivo = path.basename(urlOriginal);
        const nomeLimpo = mapaNomes[nomeArquivo] || nomeArquivo;
        
        const novaUrl = `${URL_BASE_STORAGE}${subpastaBucket}${nomeLimpo}`;

        const { error: updateError } = await supabase
            .from(tabela)
            .update({ [colunaUrl]: novaUrl })
            .eq('id', item.id);

        if (updateError) {
            console.error(`Erro ao atualizar item ${item.id}:`, updateError);
        } else {
            console.log(`✅ [${item.titulo}] Atualizado: ${nomeArquivo} -> ${novaUrl}`);
            atualizados++;
        }
    }

    console.log(`Finalizado ${tabela}: ${atualizados} itens atualizados.`);
}

async function iniciarMigracao() {
    try {
        // 1. Receitas (Imagens)
        await migrarTabela('receitas', 'imagem_url', 'receitas/');
        
        // 2. Receitas (Vídeos)
        await migrarTabela('receitas', 'video_url', 'receitas/');
        
        // 3. Treinos (Vídeos)
        await migrarTabela('treinos', 'video_url', 'exercicios/');

        console.log('\n🚀 MIGRACAO CONCLUIDA COM SUCESSO!');
    } catch (err) {
        console.error('Erro fatal na migração:', err);
    }
}

iniciarMigracao();
