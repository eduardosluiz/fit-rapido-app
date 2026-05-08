const axios = require('axios');

async function verificar() {
  try {
    const response = await axios.get('http://localhost:3001/receitas');
    const receitas = response.data;
    
    const free = receitas.filter(rec => rec.is_free === true);
    const premium = receitas.filter(rec => rec.is_premium === true);
    
    console.log(`\n📊 Estatísticas de Receitas:\n`);
    console.log(`Total de receitas: ${receitas.length}`);
    console.log(`Receitas FREE: ${free.length}`);
    console.log(`Receitas PREMIUM: ${premium.length}`);
    console.log(`Receitas sem classificação: ${receitas.length - free.length - premium.length}\n`);
    
    if (free.length >= 50) {
      console.log(`⚠️  Limite de 50 receitas FREE atingido!\n`);
      console.log(`💡 Opções:`);
      console.log(`1. Mudar algumas receitas FREE para PREMIUM`);
      console.log(`2. Mudar a nova receita para PREMIUM`);
      console.log(`3. Desmarcar is_free de algumas receitas antigas\n`);
    }
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

verificar();


