const { Client } = require('pg');
require('dotenv').config({ path: '.env' });

async function corrigirNomes() {
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

    // Verificar ingredientes com nomes numéricos
    console.log('\n📊 Verificando ingredientes com nomes numéricos...');
    const resultado = await client.query(`
      SELECT id, nome, calorias, proteinas, carboidratos, gorduras
      FROM ingredientes
      WHERE nome ~ '^[0-9]+$'
      ORDER BY nome::integer
      LIMIT 20
    `);

    console.log(`\n🔍 Encontrados ${resultado.rows.length} ingredientes com nomes numéricos (mostrando primeiros 20):\n`);
    
    resultado.rows.forEach((ing, idx) => {
      console.log(`${idx + 1}. ID: ${ing.id.substring(0, 8)}... | Nome atual: "${ing.nome}" | Calorias: ${ing.calorias}`);
    });

    if (resultado.rows.length === 0) {
      console.log('\n✅ Nenhum ingrediente com nome numérico encontrado!');
      await client.end();
      return;
    }

    console.log('\n⚠️  ATENÇÃO: Os ingredientes foram importados com números ao invés de nomes.');
    console.log('   Isso indica que a coluna "nome" do arquivo TACO não foi mapeada corretamente.');
    console.log('\n💡 SOLUÇÕES:');
    console.log('   1. Re-executar o script de importação após corrigir o mapeamento');
    console.log('   2. Ou atualizar manualmente os nomes no banco de dados');
    console.log('   3. Ou executar o script diagnosticar-taco.js para ver a estrutura do arquivo');
    
    console.log('\n📝 Para corrigir manualmente, você pode:');
    console.log('   - Executar: node scripts/diagnosticar-taco.js <caminho-do-arquivo.xlsx>');
    console.log('   - Verificar qual coluna contém os nomes dos alimentos');
    console.log('   - Ajustar o script importar-taco.js');
    console.log('   - Re-executar a importação');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Conexão encerrada.');
  }
}

corrigirNomes();

