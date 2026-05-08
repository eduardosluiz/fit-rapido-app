const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../api/.env') });

const API_URL = process.env.API_URL || 'http://localhost:3001';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fitrapido.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

async function testarBusca() {
  try {
    // Fazer login como admin
    console.log('🔐 Fazendo login como admin...\n');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      senha: ADMIN_PASSWORD,
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login realizado com sucesso!\n');
    
    // Buscar todas as receitas (como admin)
    console.log('📋 Buscando todas as receitas (incluindo inativas)...\n');
    const receitasResponse = await axios.get(`${API_URL}/receitas?incluirInativas=true`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const receitas = receitasResponse.data;
    console.log(`Total de receitas retornadas: ${receitas.length}\n`);
    
    // Buscar as duas receitas específicas
    const cestinhas = receitas.find(r => r.titulo && r.titulo.includes('Cestinhas'));
    const suco = receitas.find(r => r.titulo && r.titulo.includes('Suco Detox'));
    
    console.log('🔍 Resultado da busca:\n');
    
    if (cestinhas) {
      console.log('✅ Cestinhas de Banana:');
      console.log(`   ID: ${cestinhas.id}`);
      console.log(`   Título: ${cestinhas.titulo}`);
      console.log(`   Premium: ${cestinhas.is_premium}`);
      console.log(`   Free: ${cestinhas.is_free}`);
      console.log(`   Ativa: ${cestinhas.ativa}\n`);
    } else {
      console.log('❌ Cestinhas de Banana: NÃO ENCONTRADA na lista\n');
    }
    
    if (suco) {
      console.log('✅ Suco Detox Rosa:');
      console.log(`   ID: ${suco.id}`);
      console.log(`   Título: ${suco.titulo}`);
      console.log(`   Premium: ${suco.is_premium}`);
      console.log(`   Free: ${suco.is_free}`);
      console.log(`   Ativa: ${suco.ativa}\n`);
    } else {
      console.log('❌ Suco Detox Rosa: NÃO ENCONTRADA na lista\n');
    }
    
    // Listar últimas 10 receitas por data de criação
    console.log('📋 Últimas 10 receitas (por data de criação):\n');
    const receitasOrdenadas = receitas
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);
    
    receitasOrdenadas.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.titulo}`);
      console.log(`   Premium: ${rec.is_premium}, Free: ${rec.is_free}, Ativa: ${rec.ativa}`);
    });
    
  } catch (error) {
    console.error('Erro:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testarBusca();


