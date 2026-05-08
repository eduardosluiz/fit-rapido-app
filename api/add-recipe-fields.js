const { Client } = require('pg');
require('dotenv').config({ path: '../api/.env' });

async function updateTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('📡 Conectado ao banco para adicionar novos campos...');
    
    // Adicionar a coluna dica
    await client.query(`
      ALTER TABLE receitas 
      ADD COLUMN IF NOT EXISTS dica TEXT;
    `);

    // Adicionar a coluna is_inedito
    await client.query(`
      ALTER TABLE receitas 
      ADD COLUMN IF NOT EXISTS is_inedito BOOLEAN DEFAULT false;
    `);
    
    // Garantir que fibras e sodio existam como colunas numéricas
    await client.query(`
      ALTER TABLE receitas 
      ADD COLUMN IF NOT EXISTS fibras DECIMAL(8,2),
      ADD COLUMN IF NOT EXISTS sodio DECIMAL(8,2);
    `);

    console.log('✅ Banco de dados atualizado com sucesso (campos dica, fibras e sodio)!');
  } catch (err) {
    console.error('❌ Erro ao atualizar banco:', err.message);
  } finally {
    await client.end();
  }
}

updateTable();
