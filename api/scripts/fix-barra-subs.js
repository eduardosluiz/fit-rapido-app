const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.occddouiyqvcdhtxpbej:fitrapido248622@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado para reparo da Barra de Chocolate Fake');

    // Mapeamento exato baseado no que o usuário relatou e no padrão da receita
    const substituicoes = {
      "Pistache": "amêndoas, castanhas ou nozes",
      "Leite em pó": "leite de coco em pó",
      "Whey protein": "proteína vegetal ou colágeno",
      "Óleo de coco ou TCM": "manteiga de cacau derretida"
    };

    const res = await client.query(
      "UPDATE receitas SET substituicoes_ingredientes = $1 WHERE id = '82ec4607-d1e7-4fe5-a2fd-c3b797883f00'",
      [JSON.stringify(substituicoes)]
    );

    console.log('✨ Substituições atualizadas com sucesso para a Barra de Chocolate Fake!');
  } catch (e) {
    console.error('❌ Erro:', e.message);
  } finally {
    await client.end();
  }
}

run();
