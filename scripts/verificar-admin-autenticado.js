const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../api/.env') });

const API_URL = process.env.API_URL || 'http://localhost:3001';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fitrapido.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

async function verificar() {
  try {
    // Fazer login como admin
    console.log('🔐 Fazendo login como admin...\n');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      senha: ADMIN_PASSWORD,
    });
    
    const token = loginResponse.data.access_token;
    const user = loginResponse.data.user;
    
    console.log('✅ Login realizado com sucesso!');
    console.log(`   Usuário: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   É Admin: ${user.role === 'admin' || user.role === 'ADMIN'}\n`);
    
    // Buscar perfil para confirmar role
    console.log('👤 Buscando perfil do usuário...\n');
    const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const profile = profileResponse.data;
    console.log(`   Role no perfil: ${profile.role}`);
    console.log(`   É Admin: ${profile.role === 'admin' || profile.role === 'ADMIN'}\n`);
    
    // Buscar todas as receitas
    console.log('📋 Buscando todas as receitas...\n');
    const receitasResponse = await axios.get(`${API_URL}/receitas?incluirInativas=true`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const receitas = receitasResponse.data;
    console.log(`Total de receitas retornadas: ${receitas.length}`);
    
    const free = receitas.filter(r => r.is_free === true);
    const premium = receitas.filter(r => r.is_premium === true);
    
    console.log(`   Receitas FREE: ${free.length}`);
    console.log(`   Receitas PREMIUM: ${premium.length}\n`);
    
    // Verificar se as duas receitas estão na lista
    const cestinhas = receitas.find(r => r.titulo && r.titulo.includes('Cestinhas'));
    const suco = receitas.find(r => r.titulo && r.titulo.includes('Suco Detox'));
    
    if (cestinhas) {
      console.log(`✅ Cestinhas encontrada na lista`);
    } else {
      console.log(`❌ Cestinhas NÃO encontrada na lista`);
    }
    
    if (suco) {
      console.log(`✅ Suco Detox encontrado na lista`);
    } else {
      console.log(`❌ Suco Detox NÃO encontrado na lista`);
    }
    
  } catch (error) {
    console.error('Erro:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

verificar();


