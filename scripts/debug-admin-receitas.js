const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../api/.env') });

const API_URL = process.env.API_URL || 'http://localhost:3001';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fitrapido.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

async function debug() {
  try {
    // Login
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      senha: ADMIN_PASSWORD,
    });
    
    const token = loginResponse.data.access_token;
    const user = loginResponse.data.user;
    
    console.log('👤 Usuário logado:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Tipo: ${typeof user.role}`);
    console.log(`   É igual a 'admin': ${user.role === 'admin'}`);
    console.log(`   É igual a UserRole.ADMIN: ${user.role === 'admin'}\n`);
    
    // Buscar receitas com token
    console.log('📋 Buscando receitas com token de admin...\n');
    const receitasResponse = await axios.get(`${API_URL}/receitas?incluirInativas=true`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const receitas = receitasResponse.data;
    console.log(`Total retornado: ${receitas.length}`);
    
    // Contar por tipo
    const free = receitas.filter(r => r.is_free === true);
    const premium = receitas.filter(r => r.is_premium === true);
    const semClassificacao = receitas.filter(r => !r.is_free && !r.is_premium);
    
    console.log(`   FREE: ${free.length}`);
    console.log(`   PREMIUM: ${premium.length}`);
    console.log(`   Sem classificação: ${semClassificacao.length}\n`);
    
    // Buscar diretamente pelos IDs
    console.log('🔍 Buscando diretamente pelos IDs:\n');
    const ids = ['b29f3ad7-49ea-4e0d-ba46-657f0b140db1', '39d7b686-a2eb-4cb1-b286-298ddd0d719d'];
    
    for (const id of ids) {
      try {
        const recResponse = await axios.get(`${API_URL}/receitas/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const rec = recResponse.data;
        console.log(`✅ ID ${id}:`);
        console.log(`   Título: ${rec.titulo}`);
        console.log(`   Premium: ${rec.is_premium}`);
        console.log(`   Free: ${rec.is_free}`);
        console.log(`   Está na lista geral: ${receitas.some(r => r.id === id)}\n`);
      } catch (e) {
        console.log(`❌ ID ${id}: ${e.message}\n`);
      }
    }
    
    // Verificar se há limite na query
    console.log('📊 Verificando se há limite na query...\n');
    const todasReceitas = await axios.get(`${API_URL}/receitas?incluirInativas=true`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log(`Total de receitas retornadas: ${todasReceitas.data.length}`);
    console.log(`(Se houver limite, pode estar cortando as receitas mais antigas)\n`);
    
  } catch (error) {
    console.error('Erro:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

debug();


