const axios = require('axios');

async function verificar() {
  try {
    // Buscar todas as receitas (incluindo inativas)
    const response = await axios.get('http://localhost:3001/receitas?incluirInativas=true');
    const receitas = response.data;
    
    console.log(`\n📊 Total de receitas no banco: ${receitas.length}\n`);
    
    // Buscar Cestinhas de Banana
    const cestinhas = receitas.find(rec => 
      rec.titulo && (
        rec.titulo.toLowerCase().includes('cestinhas') || 
        rec.titulo.toLowerCase().includes('banana') && rec.titulo.toLowerCase().includes('morango')
      )
    );
    
    // Buscar Suco Detox Rosa
    const suco = receitas.find(rec => 
      rec.titulo && (
        rec.titulo.toLowerCase().includes('suco detox') || 
        rec.titulo.toLowerCase().includes('detox rosa')
      )
    );
    
    console.log('🔍 Verificando receitas cadastradas:\n');
    
    // Verificar Cestinhas
    if (cestinhas) {
      console.log('✅ Cestinhas de Banana com Morango:');
      console.log(`   ID: ${cestinhas.id}`);
      console.log(`   Título: ${cestinhas.titulo}`);
      console.log(`   Ativa: ${cestinhas.ativa}`);
      console.log(`   Premium: ${cestinhas.is_premium}`);
      console.log(`   Free: ${cestinhas.is_free}`);
      console.log(`   Criada em: ${new Date(cestinhas.created_at).toLocaleString('pt-BR')}\n`);
    } else {
      console.log('❌ Cestinhas de Banana com Morango: NÃO ENCONTRADA\n');
    }
    
    // Verificar Suco
    if (suco) {
      console.log('✅ Suco Detox Rosa:');
      console.log(`   ID: ${suco.id}`);
      console.log(`   Título: ${suco.titulo}`);
      console.log(`   Ativa: ${suco.ativa}`);
      console.log(`   Premium: ${suco.is_premium}`);
      console.log(`   Free: ${suco.is_free}`);
      console.log(`   Criada em: ${new Date(suco.created_at).toLocaleString('pt-BR')}\n`);
    } else {
      console.log('❌ Suco Detox Rosa: NÃO ENCONTRADA\n');
    }
    
    // Verificar últimas 5 receitas cadastradas
    console.log('📋 Últimas 5 receitas cadastradas (por data de criação):\n');
    const receitasOrdenadas = receitas
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
    
    receitasOrdenadas.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.titulo}`);
      console.log(`   ID: ${rec.id}`);
      console.log(`   Criada: ${new Date(rec.created_at).toLocaleString('pt-BR')}`);
      console.log(`   Ativa: ${rec.ativa}, Premium: ${rec.is_premium}, Free: ${rec.is_free}\n`);
    });
    
  } catch (error) {
    console.error('Erro:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

verificar();


