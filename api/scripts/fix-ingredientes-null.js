const { Client } = require('pg');
require('dotenv').config({ path: '.env' });

async function fixIngredientesNull() {
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

    // Verificar quantos têm NULL
    const checkResult = await client.query('SELECT COUNT(*) as total FROM ingredientes WHERE nome IS NULL');
    const totalNull = parseInt(checkResult.rows[0].total);
    
    console.log(`\n📊 Registros com nome NULL: ${totalNull}`);

    if (totalNull === 0) {
      console.log('✅ Nenhum registro com nome NULL encontrado. Tudo certo!');
      await client.end();
      return;
    }

    // Atualizar registros NULL
    console.log('\n🔧 Corrigindo registros com nome NULL...');
    const updateResult = await client.query(`
      UPDATE ingredientes 
      SET nome = 'Ingrediente_' || SUBSTRING(id::text, 1, 8)
      WHERE nome IS NULL
      RETURNING id, nome
    `);

    console.log(`✅ ${updateResult.rows.length} registros atualizados`);

    // Garantir constraint NOT NULL
    console.log('\n🔧 Aplicando constraint NOT NULL...');
    try {
      await client.query('ALTER TABLE ingredientes ALTER COLUMN nome DROP NOT NULL');
    } catch (e) {
      // Ignorar se já não tem NOT NULL
    }

    // Atualizar novamente (caso ainda existam)
    await client.query(`
      UPDATE ingredientes 
      SET nome = 'Ingrediente_' || SUBSTRING(id::text, 1, 8)
      WHERE nome IS NULL
    `);

    // Adicionar NOT NULL
    await client.query('ALTER TABLE ingredientes ALTER COLUMN nome SET NOT NULL');
    console.log('✅ Constraint NOT NULL aplicada');

    // Verificar resultado final
    const finalCheck = await client.query('SELECT COUNT(*) as total FROM ingredientes WHERE nome IS NULL');
    const finalNull = parseInt(finalCheck.rows[0].total);
    
    if (finalNull === 0) {
      console.log('\n✅ SUCESSO! Todos os registros foram corrigidos.');
      console.log('   Você pode iniciar a API agora.');
    } else {
      console.log(`\n⚠️  Ainda existem ${finalNull} registros com nome NULL`);
    }

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Conexão encerrada.');
  }
}

fixIngredientesNull();

