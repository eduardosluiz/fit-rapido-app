const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.occddouiyqvcdhtxpbej:fitrapido248622@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de produção para REPARO TOTAL');

    // 1. Limpeza Universal de Dados Corrompidos
    console.log('\n🧹 Passo 1: Limpeza de campos JSON corrompidos...');
    const allProd = await client.query('SELECT id, titulo, tags, ingredientes, modo_preparo FROM receitas');
    for (const row of allProd.rows) {
      let needsUpdate = false;
      const updates = {};
      ['tags', 'ingredientes', 'modo_preparo'].forEach(field => {
        const val = row[field];
        if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string' && val[0].startsWith('{')) {
          try {
            const fullString = val.join('');
            const parsed = JSON.parse(fullString);
            updates[field] = Object.values(parsed);
            needsUpdate = true;
          } catch (e) {}
        }
      });
      if (needsUpdate) {
        await client.query(`UPDATE receitas SET tags=$1, ingredientes=$2, modo_preparo=$3 WHERE id=$4`, 
          [updates.tags || row.tags, updates.ingredientes || row.ingredientes, updates.modo_preparo || row.modo_preparo, row.id]);
      }
    }

    // 2. Extrair dados de scripts individuais
    console.log('\n🔄 Passo 2: Extraindo dados de scripts de cadastro...');
    const scriptsDir = path.join(__dirname, '../../scripts');
    const files = fs.readdirSync(scriptsDir).filter(f => f.startsWith('cadastrar-') && f.endsWith('.js'));
    
    let repairCount = 0;
    for (const file of files) {
      const content = fs.readFileSync(path.join(scriptsDir, file), 'utf8');
      // Tenta extrair o objeto receita via regex simples
      const match = content.match(/const receita = ({[\s\S]*?});/);
      if (match) {
        try {
          // Usa eval de forma controlada apenas no objeto capturado para transformá-lo em JSON real
          // (Os scripts são arquivos locais confiáveis do projeto)
          const receita = eval(`(${match[1]})`);
          
          // Busca no banco de produção
          const titleBase = receita.titulo.replace(/[^\w\s]/gi, '').split(/\s+/).filter(w => w.length > 3).slice(0, 2).join('%');
          const res = await client.query("SELECT id FROM receitas WHERE titulo ILIKE $1 LIMIT 1", [`%${titleBase}%`]);
          
          if (res.rows.length > 0) {
            await client.query(`
              UPDATE receitas 
              SET substituicoes_ingredientes = $1, tags = $2, calorias = $3, proteinas = $4, carboidratos = $5, gorduras = $6, fibras = $7, sodio = $8, descricao = $9
              WHERE id = $10
            `, [
              receita.substituicoes_ingredientes || {},
              receita.tags || [],
              String(receita.calorias || ''),
              String(receita.proteinas || ''),
              String(receita.carboidratos || ''),
              String(receita.gorduras || ''),
              String(receita.fibras || ''),
              String(receita.sodio || ''),
              receita.descricao || '',
              res.rows[0].id
            ]);
            repairCount++;
          }
        } catch (e) {}
      }
    }

    // 3. Sincronizar com receitas.json (o que sobrar)
    console.log('\n🔄 Passo 3: Sincronizando com receitas.json...');
    const jsonPath = path.join(__dirname, '../../scripts/receitas.json');
    const localData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    for (const local of localData) {
      const titleBase = local.titulo.replace(/[^\w\s]/gi, '').split(/\s+/).filter(w => w.length > 3).slice(0, 2).join('%');
      const res = await client.query("SELECT id FROM receitas WHERE titulo ILIKE $1 LIMIT 1", [`%${titleBase}%`]);
      if (res.rows.length > 0) {
        await client.query(`
          UPDATE receitas 
          SET substituicoes_ingredientes = $1, tags = $2, calorias = $3, proteinas = $4, carboidratos = $5, gorduras = $6, fibras = $7, sodio = $8
          WHERE id = $9
        `, [
          local.substituicoes_ingredientes || {},
          local.tags || [],
          String(local.calorias || ''),
          String(local.proteinas || ''),
          String(local.carboidratos || ''),
          String(local.gorduras || ''),
          String(local.fibras || ''),
          String(local.sodio || ''),
          res.rows[0].id
        ]);
        repairCount++;
      }
    }

    console.log(`\n✨ REPARO CONCLUÍDO! Total de reparos realizados: ${repairCount}`);

  } catch (e) {
    console.error('❌ Erro:', e.message);
  } finally {
    await client.end();
  }
}

run();
