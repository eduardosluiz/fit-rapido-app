const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.occddouiyqvcdhtxpbej:fitrapido248622@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de produção');

    console.log('🛠️ Alterando tipos de colunas nutricionais para TEXT...');
    
    // Alterar colunas para text
    const columns = ['calorias', 'proteinas', 'carboidratos', 'gorduras', 'fibras', 'sodio'];
    for (const col of columns) {
      console.log(`   - Alterando ${col}...`);
      await client.query(`ALTER TABLE receitas ALTER COLUMN ${col} TYPE TEXT USING ${col}::TEXT`);
    }

    console.log('🛠️ Adicionando coluna finalizacao se não existir...');
    await client.query('ALTER TABLE receitas ADD COLUMN IF NOT EXISTS finalizacao TEXT');

    console.log('\n✨ Alterações de banco concluídas com sucesso!');
  } catch (e) {
    console.error('❌ Erro durante a atualização do banco:', e.message);
  } finally {
    await client.end();
  }
}

run();
