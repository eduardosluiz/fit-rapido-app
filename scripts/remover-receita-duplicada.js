/**
 * Script para remover receita duplicada
 * Remove a receita de Hambúrguer que foi cadastrada duas vezes
 */

const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../api/.env') });

const API_URL = process.env.API_URL || 'http://localhost:3001';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fitrapido.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

async function removerDuplicada() {
  try {
    console.log(`${colors.cyan}🔐 Fazendo login...${colors.reset}`);
    
    // Login
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      senha: ADMIN_PASSWORD,
    });

    const token = loginResponse.data.access_token;
    console.log(`${colors.green}✅ Login realizado!${colors.reset}\n`);

    // Buscar todas as receitas
    console.log(`${colors.cyan}📚 Buscando receitas...${colors.reset}`);
    const receitasResponse = await axios.get(`${API_URL}/receitas`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const receitas = receitasResponse.data;
    console.log(`   Encontradas ${receitas.length} receitas\n`);

    // Listar todas as receitas
    console.log(`${colors.cyan}📋 Listando todas as receitas:${colors.reset}`);
    receitas.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.titulo}`);
      console.log(`      ID: ${r.id}`);
      console.log(`      Status: ${r.ativa ? 'Ativa' : 'Inativa'}`);
      console.log('');
    });

    // Encontrar receitas duplicadas de Hambúrguer
    const hamburgueres = receitas.filter(r => 
      r.titulo && (r.titulo.includes('Hambúrguer') || r.titulo.includes('Hamburger'))
    );

    console.log(`${colors.yellow}🍔 Receitas de Hambúrguer encontradas: ${hamburgueres.length}${colors.reset}\n`);

    if (hamburgueres.length <= 1) {
      console.log(`${colors.yellow}⚠️  Não foram encontradas receitas duplicadas${colors.reset}`);
      return;
    }

    console.log(`${colors.yellow}⚠️  Encontradas ${hamburgueres.length} receitas de Hambúrguer:${colors.reset}`);
    hamburgueres.forEach((r, i) => {
      console.log(`   ${i + 1}. ID: ${r.id}`);
      console.log(`      Título: ${r.titulo}`);
      console.log(`      Status: ${r.ativa ? 'Ativa' : 'Inativa'}`);
      console.log(`      Criada em: ${r.created_at || 'N/A'}\n`);
    });

    // Remover todas exceto a primeira (ou a mais recente)
    // Vamos manter a mais recente (última criada) e remover as outras
    const receitasParaRemover = hamburgueres.slice(0, -1); // Remove todas exceto a última

    console.log(`${colors.cyan}🗑️  Removendo ${receitasParaRemover.length} receita(s) duplicada(s)...${colors.reset}\n`);

    for (const receita of receitasParaRemover) {
      try {
        await axios.delete(`${API_URL}/receitas/${receita.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(`${colors.green}✅ Removida: ${receita.titulo} (${receita.id})${colors.reset}`);
      } catch (error) {
        console.log(`${colors.red}❌ Erro ao remover ${receita.id}:${colors.reset}`, error.response?.data || error.message);
      }
    }

    console.log(`\n${colors.green}✅ Concluído!${colors.reset}`);

  } catch (error) {
    if (error.response) {
      console.error(`${colors.red}❌ Erro:${colors.reset}`, error.response.data || error.message);
    } else {
      console.error(`${colors.red}❌ Erro:${colors.reset}`, error.message);
    }
  }
}

removerDuplicada();

