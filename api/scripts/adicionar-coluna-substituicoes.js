const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function adicionarColuna() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados');

    // Verificar se a coluna já existe
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'receitas' 
      AND column_name = 'substituicoes_ingredientes'
    `);

    if (checkResult.rows.length > 0) {
      console.log('ℹ️  A coluna substituicoes_ingredientes já existe no banco de dados');
      return;
    }

    // Adicionar a coluna
    await client.query(`
      ALTER TABLE receitas 
      ADD COLUMN substituicoes_ingredientes JSONB NULL
    `);

    console.log('✅ Coluna substituicoes_ingredientes adicionada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao adicionar coluna:', error.message);
    if (error.code === '42701') {
      console.log('ℹ️  A coluna já existe no banco de dados');
    } else {
      throw error;
    }
  } finally {
    await client.end();
  }
}

adicionarColuna().catch((error) => {
  console.error('Erro fatal:', error);
  process.exit(1);
});


