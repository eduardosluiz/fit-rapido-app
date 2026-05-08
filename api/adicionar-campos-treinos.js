/**
 * Script para adicionar os novos campos na tabela treinos
 * Execute: cd api && node adicionar-campos-treinos.js
 */

const { Client } = require('pg');
require('dotenv').config();

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

    // Adicionar is_inedito
    await client.query('ALTER TABLE treinos ADD COLUMN IF NOT EXISTS is_inedito BOOLEAN DEFAULT false;');
    console.log('✅ Coluna is_inedito adicionada');

    // Criar índices
    await client.query('CREATE INDEX IF NOT EXISTS IDX_treinos_tipo_treino ON treinos(tipo_treino);');
    await client.query('CREATE INDEX IF NOT EXISTS IDX_treinos_tipo_dica ON treinos(tipo_dica);');
    await client.query('CREATE INDEX IF NOT EXISTS IDX_treinos_mostrar_ponto_partida ON treinos(mostrar_ponto_partida);');
    await client.query('CREATE INDEX IF NOT EXISTS IDX_treinos_is_inedito ON treinos(is_inedito);');
    console.log('✅ Índices criados');

    // Verificar colunas criadas
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'treinos'
      AND column_name IN ('tipo_treino', 'tipo_dica', 'tipo_equipamento_casa', 'substituicoes_exercicios', 'mostrar_ponto_partida', 'is_inedito')
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
