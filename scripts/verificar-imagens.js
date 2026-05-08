const axios = require('axios');

async function verificarImagens() {
  try {
    const response = await axios.get('http://localhost:3001/receitas');
    const receitas = response.data;
    
    console.log(`\n📊 Verificando imagens de ${receitas.length} receitas:\n`);
    
    const comImagem = receitas.filter(rec => {
      const temImagemUrl = rec.imagem_url && rec.imagem_url.trim() !== '';
      const temImagensUrl = rec.imagens_url && Array.isArray(rec.imagens_url) && rec.imagens_url.length > 0;
      return temImagemUrl || temImagensUrl;
    });
    
    console.log(`✅ Receitas COM imagem: ${comImagem.length} de ${receitas.length}\n`);
    
    if (comImagem.length > 0) {
      console.log('Receitas com imagens:');
      comImagem.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec.titulo}`);
        console.log(`   imagem_url: ${rec.imagem_url || 'null'}`);
        console.log(`   imagens_url: ${JSON.stringify(rec.imagens_url || [])}\n`);
      });
    }
    
    const semImagem = receitas.filter(rec => {
      const temImagemUrl = rec.imagem_url && rec.imagem_url.trim() !== '';
      const temImagensUrl = rec.imagens_url && Array.isArray(rec.imagens_url) && rec.imagens_url.length > 0;
      return !temImagemUrl && !temImagensUrl;
    });
    
    console.log(`\n❌ Receitas SEM imagem: ${semImagem.length} de ${receitas.length}\n`);
    console.log('Primeiras 10 receitas sem imagem:');
    semImagem.slice(0, 10).forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.titulo}`);
    });
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

verificarImagens();

