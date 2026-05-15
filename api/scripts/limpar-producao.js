const { Client } = require('pg');
require('dotenv').config({ path: './api/.env' });

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.occddouiyqvcdhtxpbej:fitrapido248622@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de produção');

    const tables = ['receitas', 'treinos', 'exercicios_biblioteca', 'treinos_modalidades'];
    
    for (const table of tables) {
      console.log(`🧹 Limpando localhost na tabela ${table}...`);
      const res = await client.query(`
        UPDATE ${table} 
        SET imagem_url = REPLACE(imagem_url, 'http://localhost:3001', '') 
        WHERE imagem_url LIKE 'http://localhost:3001%'
      `);
      console.log(`   ✅ ${res.rowCount} linhas corrigidas em ${table}`);
    }

    // Corrigir carrossel de imagens (array)
    console.log('🧹 Limpando localhost no carrossel de receitas...');
    const resCarrossel = await client.query(`
      UPDATE receitas 
      SET imagens_url = (
        SELECT array_agg(REPLACE(u, 'http://localhost:3001', '')) 
        FROM unnest(imagens_url) u
      ) 
      WHERE array_to_string(imagens_url, ',') LIKE '%localhost:3001%'
    `);
    console.log(`   ✅ ${resCarrossel.rowCount} carrosséis corrigidos`);

    console.log('\n✨ Limpeza concluída com sucesso!');
  } catch (e) {
    console.error('❌ Erro durante a limpeza:', e.message);
  } finally {
    await client.end();
  }
}

run();
