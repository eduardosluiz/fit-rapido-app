const { Client } = require('pg');
require('dotenv').config({ path: '.env' });

async function fixIngredientesNome() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não encontrada no .env');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado!');

    // Verificar estrutura atual
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'ingredientes' AND column_name = 'nome'
    `);

    if (tableInfo.rows.length === 0) {
      console.log('⚠️  Coluna "nome" não existe. Criando...');
      await client.query(`
        ALTER TABLE ingredientes 
        ADD COLUMN nome VARCHAR(255)
      `);
    } else {
      console.log('📊 Coluna "nome" existe:', tableInfo.rows[0]);
    }

    // Verificar quantos têm NULL
    const checkResult = await client.query('SELECT COUNT(*) as total FROM ingredientes WHERE nome IS NULL');
    const totalNull = parseInt(checkResult.rows[0].total);
    
    console.log(`\n📊 Registros com nome NULL: ${totalNull}`);

    if (totalNull > 0) {
      console.log('\n🔧 Corrigindo registros com nome NULL...');
      
      // Primeiro, remover constraint NOT NULL se existir
      try {
        await client.query('ALTER TABLE ingredientes ALTER COLUMN nome DROP NOT NULL');
        console.log('   ✓ Constraint NOT NULL removida temporariamente');
      } catch (e) {
        console.log('   ℹ️  Constraint NOT NULL não existia ou já foi removida');
      }

      // Atualizar registros NULL
      const updateResult = await client.query(`
        UPDATE ingredientes 
        SET nome = 'Ingrediente_' || SUBSTRING(id::text, 1, 8)
        WHERE nome IS NULL
        RETURNING id, nome
      `);

      console.log(`   ✅ ${updateResult.rows.length} registros atualizados`);

      // Verificar novamente
      const checkAfter = await client.query('SELECT COUNT(*) as total FROM ingredientes WHERE nome IS NULL');
      const stillNull = parseInt(checkAfter.rows[0].total);
      
      if (stillNull > 0) {
        console.log(`\n⚠️  Ainda existem ${stillNull} registros NULL. Tentando outra abordagem...`);
        
        // Tentar usar um nome mais específico
        await client.query(`
          UPDATE ingredientes 
          SET nome = 'Ingrediente_' || id::text
          WHERE nome IS NULL
        `);
      }
    }

    // Garantir que não há NULLs antes de adicionar constraint
    const finalCheck = await client.query('SELECT COUNT(*) as total FROM ingredientes WHERE nome IS NULL');
    const finalNull = parseInt(finalCheck.rows[0].total);
    
    if (finalNull === 0) {
      console.log('\n🔧 Aplicando constraint NOT NULL...');
      try {
        await client.query('ALTER TABLE ingredientes ALTER COLUMN nome SET NOT NULL');
        console.log('   ✅ Constraint NOT NULL aplicada');
      } catch (e) {
        console.log('   ⚠️  Erro ao aplicar constraint:', e.message);
      }

      // Adicionar UNIQUE se não existir
      try {
        await client.query('ALTER TABLE ingredientes ADD CONSTRAINT ingredientes_nome_key UNIQUE (nome)');
        console.log('   ✅ Constraint UNIQUE aplicada');
      } catch (e) {
        if (e.message.includes('already exists')) {
          console.log('   ℹ️  Constraint UNIQUE já existe');
        } else {
          console.log('   ⚠️  Erro ao aplicar UNIQUE:', e.message);
        }
      }

      console.log('\n✅ SUCESSO! Tabela ingredientes corrigida.');
    } else {
      console.log(`\n❌ ERRO: Ainda existem ${finalNull} registros com nome NULL`);
      console.log('   Execute este SQL manualmente no Supabase:');
      console.log('   UPDATE ingredientes SET nome = \'Ingrediente_\' || id::text WHERE nome IS NULL;');
    }

    // Estatísticas finais
    const stats = await client.query('SELECT COUNT(*) as total FROM ingredientes');
    console.log(`\n📊 Total de ingredientes: ${stats.rows[0].total}`);

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Conexão encerrada.');
  }
}

fixIngredientesNome();

