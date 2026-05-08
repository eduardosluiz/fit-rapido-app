const { Client } = require('pg');
require('dotenv').config({ path: '../api/.env' });

async function fixTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('📡 Conectado ao banco para correção...');
    
    // Adicionar a coluna video_thumbnail_url se não existir
    await client.query(`
      ALTER TABLE exercicios_biblioteca 
      ADD COLUMN IF NOT EXISTS video_thumbnail_url TEXT;
    `);
    
    // Aproveitar para garantir que 'categoria' e outros campos existam (backup)
    await client.query(`
      ALTER TABLE exercicios_biblioteca 
      ADD COLUMN IF NOT EXISTS categoria VARCHAR(255);
    `);

    console.log('✅ Banco de dados atualizado com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao atualizar banco:', err.message);
  } finally {
    await client.end();
  }
}

fixTable();
