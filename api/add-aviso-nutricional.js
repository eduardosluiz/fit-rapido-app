/**
 * Script para adicionar a coluna aviso_nutricional à tabela receitas
 * Execute: node add-aviso-nutricional.js
 */

require('dotenv').config();
const { Client } = require('pg');

async function addColumn() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados');

    // Adicionar coluna se não existir
    await client.query(`
      ALTER TABLE receitas 
      ADD COLUMN IF NOT EXISTS aviso_nutricional TEXT;
    `);

    console.log('✅ Coluna aviso_nutricional adicionada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao adicionar coluna:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addColumn();
