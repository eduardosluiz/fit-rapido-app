/**
 * Script para adicionar as tabelas de atividades e avaliações
 * Execute: node add-atividades-avaliacoes.js
 */

require('dotenv').config();
const { Client } = require('pg');

async function addTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados');

    // Criar enum para tipo de atividade
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "TipoAtividade" AS ENUM ('fiz_receita', 'treinei_hoje');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Criar enum para tipo de avaliação
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "TipoAvaliacao" AS ENUM ('receita', 'treino');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // A tabela de usuários é "usuarios"
    const userTableName = 'usuarios';
    console.log(`📋 Usando tabela de usuários: ${userTableName}`);

    // Criar tabela de atividades
    await client.query(`
      CREATE TABLE IF NOT EXISTS atividades (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        usuario_id UUID NOT NULL REFERENCES ${userTableName}(id) ON DELETE CASCADE,
        item_id UUID NOT NULL,
        tipo "TipoAtividade" NOT NULL,
        data DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(usuario_id, item_id, tipo, data)
      );
    `);

    // Criar índices para atividades
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_atividades_usuario ON atividades(usuario_id);
      CREATE INDEX IF NOT EXISTS idx_atividades_item ON atividades(item_id);
      CREATE INDEX IF NOT EXISTS idx_atividades_tipo ON atividades(tipo);
    `);

    // Criar tabela de avaliações
    await client.query(`
      CREATE TABLE IF NOT EXISTS avaliacoes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        usuario_id UUID NOT NULL REFERENCES ${userTableName}(id) ON DELETE CASCADE,
        item_id UUID NOT NULL,
        tipo "TipoAvaliacao" NOT NULL,
        nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
        comentario TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(usuario_id, item_id, tipo)
      );
    `);

    // Criar índices para avaliações
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_avaliacoes_usuario ON avaliacoes(usuario_id);
      CREATE INDEX IF NOT EXISTS idx_avaliacoes_item ON avaliacoes(item_id);
      CREATE INDEX IF NOT EXISTS idx_avaliacoes_tipo ON avaliacoes(tipo);
    `);

    console.log('✅ Tabelas de atividades e avaliações criadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addTables();
