const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.occddouiyqvcdhtxpbej:fitrapido248622@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
    ssl: { rejectUnauthorized: false }
  });

  try {
    const jsonPath = path.join(__dirname, '../../scripts/receitas.json');
    const localData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`✅ Carregadas ${localData.length} receitas locais.`);

    await client.connect();
    console.log('✅ Conectado à produção');

    // 1. Limpeza Universal (Fix Dirty Data)
    console.log('🧹 Iniciando limpeza universal de dados corrompidos...');
    const allProd = await client.query('SELECT id, titulo, tags, ingredientes, modo_preparo FROM receitas');
    for (const row of allProd.rows) {
      let needsUpdate = false;
      const updates = {};

      ['tags', 'ingredientes', 'modo_preparo'].forEach(field => {
        const val = row[field];
        if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string' && val[0].startsWith('{')) {
          try {
            // Tenta remontar o array a partir do objeto quebrado
            const fullString = val.join('');
            const parsed = JSON.parse(fullString);
            updates[field] = Object.values(parsed);
            needsUpdate = true;
          } catch (e) {}
        }
      });

      if (needsUpdate) {
        console.log(`   ✨ Limpando dados de: ${row.titulo}`);
        await client.query(`UPDATE receitas SET tags=$1, ingredientes=$2, modo_preparo=$3 WHERE id=$4`, 
          [updates.tags || row.tags, updates.ingredientes || row.ingredientes, updates.modo_preparo || row.modo_preparo, row.id]);
      }
    }

    // 2. Sincronização Inteligente
    console.log('\n🔄 Sincronizando substituições e detalhes de receitas locais...');
    let syncCount = 0;
    for (const local of localData) {
      // Pega as primeiras 3 palavras do título para busca
      const titleWords = local.titulo.replace(/[^\w\s]/gi, '').split(/\s+/).filter(w => w.length > 3).slice(0, 3).join('%');
      
      const res = await client.query(
        "SELECT id, titulo FROM receitas WHERE titulo ILIKE $1 LIMIT 1", 
        [`%${titleWords}%`]
      );

      if (res.rows.length > 0) {
        const prod = res.rows[0];
        await client.query(`
          UPDATE receitas 
          SET substituicoes_ingredientes = $1, tags = $2, calorias = $3, proteinas = $4, carboidratos = $5, gorduras = $6
          WHERE id = $7
        `, [
          local.substituicoes_ingredientes || {},
          local.tags || [],
          String(local.calorias || ''),
          String(local.proteinas || ''),
          String(local.carboidratos || ''),
          String(local.gorduras || ''),
          prod.id
        ]);
        syncCount++;
      }
    }

    console.log(`\n✅ Sucesso! Sincronizados ${syncCount} itens e banco limpo.`);
  } catch (e) {
    console.error('❌ Erro:', e.message);
  } finally {
    await client.end();
  }
}

run();
