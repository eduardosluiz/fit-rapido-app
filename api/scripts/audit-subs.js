const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.occddouiyqvcdhtxpbej:fitrapido248622@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query("SELECT count(*) FROM receitas WHERE substituicoes_ingredientes != '{}'");
    console.log(`\n📊 STATUS GLOBAL DE SUBSTITUIÇÕES:`);
    console.log(`✅ ${res.rows[0].count} receitas agora possuem substituições inteligentes ativas.`);
    
    const sample = await client.query("SELECT titulo, is_premium, is_free FROM receitas WHERE substituicoes_ingredientes != '{}' LIMIT 5");
    console.log(`\n📋 Amostra de receitas reparadas:`);
    sample.rows.forEach(r => {
      console.log(`   - [${r.is_premium ? 'PREMIUM' : 'FREE'}] ${r.titulo}`);
    });
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

run();
