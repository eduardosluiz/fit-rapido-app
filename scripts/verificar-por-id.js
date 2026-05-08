const axios = require('axios');

async function verificar() {
  const ids = [
    'b29f3ad7-49ea-4e0d-ba46-657f0b140db1', // Cestinhas
    '39d7b686-a2eb-4cb1-b286-298ddd0d719d'  // Suco Detox
  ];
  
  console.log('\n🔍 Verificando receitas pelos IDs retornados:\n');
  
  for (const id of ids) {
    try {
      const response = await axios.get(`http://localhost:3001/receitas/${id}`);
      const rec = response.data;
      console.log(`✅ ID: ${id}`);
      console.log(`   Título: ${rec.titulo}`);
      console.log(`   Ativa: ${rec.ativa}`);
      console.log(`   Premium: ${rec.is_premium}`);
      console.log(`   Free: ${rec.is_free}`);
      console.log(`   Criada: ${new Date(rec.created_at).toLocaleString('pt-BR')}\n`);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`❌ ID: ${id} - NÃO ENCONTRADA (404)\n`);
      } else {
        console.log(`❌ ID: ${id} - Erro: ${error.message}\n`);
      }
    }
  }
}

verificar();


