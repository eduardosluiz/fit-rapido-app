const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.occddouiyqvcdhtxpbej:fitrapido248622@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de produção para limpeza profunda');

    const recipes = await client.query('SELECT id, titulo, ingredientes, modo_preparo, tags, substituicoes_ingredientes FROM receitas');
    console.log(`📊 Processando ${recipes.rows.length} receitas...`);

    for (const row of recipes.rows) {
      let needsUpdate = false;
      const updates = {};

      // Corrigir campos que deveriam ser arrays mas podem estar como strings JSON de objetos
      const arrayFields = ['ingredientes', 'modo_preparo', 'tags'];
      for (const field of arrayFields) {
        let value = row[field];
        
        // Se o valor for uma string que parece um objeto JSON {"0": "..."}
        if (typeof value === 'string' && value.startsWith('{') && value.includes('":')) {
          try {
            const parsed = JSON.parse(value);
            if (typeof parsed === 'object' && !Array.isArray(parsed)) {
              updates[field] = Object.values(parsed);
              needsUpdate = true;
              console.log(`   🧹 Corrigindo ${field} na receita: ${row.titulo}`);
            }
          } catch (e) {
            // Não é JSON válido, ignora
          }
        } 
        // Se for um array que contém strings JSON
        else if (Array.isArray(value) && value.length === 1 && typeof value[0] === 'string' && value[0].startsWith('{')) {
           try {
            const parsed = JSON.parse(value[0]);
            if (typeof parsed === 'object' && !Array.isArray(parsed)) {
              updates[field] = Object.values(parsed);
              needsUpdate = true;
              console.log(`   🧹 Corrigindo array aninhado em ${field}: ${row.titulo}`);
            }
          } catch (e) {}
        }
      }

      if (needsUpdate) {
        const setClause = Object.keys(updates).map((key, i) => `${key} = $${i + 2}`).join(', ');
        const values = Object.values(updates);
        await client.query(`UPDATE receitas SET ${setClause} WHERE id = $1`, [row.id, ...values]);
      }
    }

    console.log('\n✨ Limpeza concluída! Tente recarregar o Admin agora.');
  } catch (e) {
    console.error('❌ Erro durante a limpeza:', e.message);
  } finally {
    await client.end();
  }
}

run();
