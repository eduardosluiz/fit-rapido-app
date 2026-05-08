/**
 * Script para adicionar o campo exercicios_detalhados na tabela treinos
 * Execute: cd api && node adicionar-exercicios-detalhados.js
 */

const { Client } = require('pg');
require('dotenv').config();

async function adicionarCampo() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados');

    // Adicionar exercicios_detalhados (JSONB já suporta arrays de objetos)
    // Como series_repeticoes já é JSONB, podemos usar o mesmo tipo
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'treinos' AND column_name = 'exercicios_detalhados'
        ) THEN
          ALTER TABLE treinos ADD COLUMN exercicios_detalhados JSONB;
          CREATE INDEX IF NOT EXISTS IDX_treinos_exercicios_detalhados ON treinos USING GIN (exercicios_detalhados);
          RAISE NOTICE 'Coluna exercicios_detalhados adicionada';
        ELSE
          RAISE NOTICE 'Coluna exercicios_detalhados já existe';
        END IF;
      END $$;
    `);
    console.log('✅ Coluna exercicios_detalhados verificada/criada');

    // Verificar coluna criada
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'treinos'
      AND column_name = 'exercicios_detalhados';
    `);

    if (result.rows.length > 0) {
      console.log('\n📋 Coluna verificada:');
      result.rows.forEach(row => {
        console.log(`   - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
    }

    console.log('\n✅ Migration concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Conexão encerrada');
  }
}

adicionarCampo().catch(console.error);
