const axios = require('axios');

async function verificar() {
  try {
    const allRecipes = await axios.get('http://localhost:3001/receitas');
    const receitas = allRecipes.data;
    
    // Verificar Coxinha
    const coxinhas = receitas.filter(r => 
      r.titulo.toLowerCase().includes('coxinha')
    );
    
    console.log('\n🐔 Coxinhas encontradas:\n');
    coxinhas.forEach(r => {
      console.log(`- ${r.titulo}`);
      console.log(`  ID: ${r.id}`);
      console.log(`  Criada: ${new Date(r.created_at).toLocaleString('pt-BR')}`);
      console.log(`  Tem imagem: ${r.imagem_url ? 'SIM' : 'NÃO'}`);
      console.log('');
    });
    
    // Verificar Creme de Castanhas
    const cremes = receitas.filter(r => 
      r.titulo.toLowerCase().includes('creme de castanhas')
    );
    
    console.log('\n🥜 Cremes de Castanhas encontrados:\n');
    cremes.forEach(r => {
      console.log(`- ${r.titulo}`);
      console.log(`  ID: ${r.id}`);
      console.log(`  Criada: ${new Date(r.created_at).toLocaleString('pt-BR')}`);
      console.log(`  Tem imagem: ${r.imagem_url ? 'SIM' : 'NÃO'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

verificar();


