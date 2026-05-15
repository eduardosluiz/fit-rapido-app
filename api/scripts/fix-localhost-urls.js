const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function fixUrls() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL não encontrada no .env');
    return;
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados');

    // 1. Corrigir imagem_url nas receitas
    const resReceitas = await client.query(`
      UPDATE receitas 
      SET imagem_url = REPLACE(imagem_url, 'http://localhost:3001', '')
      WHERE imagem_url LIKE 'http://localhost:3001%'
    `);
    console.log(`✅ ${resReceitas.rowCount} URLs de imagem_url corrigidas em receitas`);

    // 2. Corrigir video_url nas receitas
    const resVideos = await client.query(`
      UPDATE receitas 
      SET video_url = REPLACE(video_url, 'http://localhost:3001', '')
      WHERE video_url LIKE 'http://localhost:3001%'
    `);
    console.log(`✅ ${resVideos.rowCount} URLs de video_url corrigidas em receitas`);

    // 3. Corrigir imagens_url (array) nas receitas
    const resImagensArray = await client.query(`
      UPDATE receitas 
      SET imagens_url = (
        SELECT array_agg(REPLACE(url, 'http://localhost:3001', ''))
        FROM unnest(imagens_url) AS url
      )
      WHERE EXISTS (
        SELECT 1 FROM unnest(imagens_url) AS url WHERE url LIKE 'http://localhost:3001%'
      )
    `);
    console.log(`✅ ${resImagensArray.rowCount} arrays de imagens_url corrigidos em receitas`);

    // 4. Corrigir vídeo_url na biblioteca de exercícios
    const resExercicios = await client.query(`
      UPDATE treinos 
      SET video_url = REPLACE(video_url, 'http://localhost:3001', '')
      WHERE video_url LIKE 'http://localhost:3001%'
    `);
    console.log(`✅ ${resExercicios.rowCount} URLs corrigidas na biblioteca de mídias (treinos)`);

    // 5. Corrigir imagem_url nas modalidades
    const resModalidades = await client.query(`
      UPDATE modalidades 
      SET imagem_url = REPLACE(imagem_url, 'http://localhost:3001', '')
      WHERE imagem_url LIKE 'http://localhost:3001%'
    `);
    console.log(`✅ ${resModalidades.rowCount} URLs de imagem_url corrigidas em modalidades`);

    console.log('\n🚀 Todas as URLs do localhost foram convertidas para caminhos relativos.');
    console.log('O frontend agora cuidará de injetar a API_URL correta dinamicamente.');

  } catch (error) {
    console.error('❌ Erro ao corrigir URLs:', error.message);
  } finally {
    await client.end();
  }
}

fixUrls().catch((error) => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
