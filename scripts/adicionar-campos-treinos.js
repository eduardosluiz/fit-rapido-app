/**
 * Script para adicionar os novos campos na tabela treinos
 * Execute: node scripts/adicionar-campos-treinos.js
 */

const path = require('path');

// Caminho para a pasta api
const apiPath = path.join(__dirname, '../api');

// Adicionar node_modules da api ao require path
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id) {
  if (id === 'pg' || id === 'dotenv') {
    try {
      return originalRequire.call(this, path.join(apiPath, 'node_modules', id));
    } catch (e) {
      // Se não encontrar, tenta o caminho padrão
    }
  }
  return originalRequire.apply(this, arguments);
};

const { Client } = require('pg');
require('dotenv').config({ path: path.join(apiPath, '.env') });

async function adicionarCampos() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados');

    // Adicionar tipo_treino
    await client.query('ALTER TABLE treinos ADD COLUMN IF NOT EXISTS tipo_treino VARCHAR;');
    console.log('✅ Coluna tipo_treino adicionada');

    // Adicionar tipo_dica
    await client.query('ALTER TABLE treinos ADD COLUMN IF NOT EXISTS tipo_dica VARCHAR;');
    console.log('✅ Coluna tipo_dica adicionada');

    // Adicionar tipo_equipamento_casa
    await client.query('ALTER TABLE treinos ADD COLUMN IF NOT EXISTS tipo_equipamento_casa VARCHAR;');
    console.log('✅ Coluna tipo_equipamento_casa adicionada');

    // Adicionar substituicoes_exercicios
    await client.query('ALTER TABLE treinos ADD COLUMN IF NOT EXISTS substituicoes_exercicios JSONB;');
    console.log('✅ Coluna substituicoes_exercicios adicionada');

    // Adicionar mostrar_ponto_partida
    await client.query('ALTER TABLE treinos ADD COLUMN IF NOT EXISTS mostrar_ponto_partida BOOLEAN DEFAULT false;');
    console.log('✅ Coluna mostrar_ponto_partida adicionada');

    // Criar índices
    await client.query('CREATE INDEX IF NOT EXISTS IDX_treinos_tipo_treino ON treinos(tipo_treino);');
    await client.query('CREATE INDEX IF NOT EXISTS IDX_treinos_tipo_dica ON treinos(tipo_dica);');
    await client.query('CREATE INDEX IF NOT EXISTS IDX_treinos_mostrar_ponto_partida ON treinos(mostrar_ponto_partida);');
    console.log('✅ Índices criados');

    // Verificar colunas criadas
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'treinos'
      AND column_name IN ('tipo_treino', 'tipo_dica', 'tipo_equipamento_casa', 'substituicoes_exercicios', 'mostrar_ponto_partida')
      ORDER BY column_name;
    `);

    console.log('\n📋 Colunas verificadas:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    console.log('\n✅ Migration concluída com sucesso!');
  } catch (error) {
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log('⚠️  Algumas colunas/índices já existem (isso é normal)');
    } else {
      console.error('❌ Erro ao executar migration:', error.message);
      throw error;
    }
  } finally {
    await client.end();
    console.log('🔌 Conexão encerrada');
  }
}

adicionarCampos().catch(console.error);
