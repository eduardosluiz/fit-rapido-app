/**
 * Script para remover receita por ID
 * 
 * Uso: node scripts/remover-receita-por-id.js <ID_DA_RECEITA>
 * Exemplo: node scripts/remover-receita-por-id.js 675bddd6-fd83-4cbe-b90c-fa0f1efc0073
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

async function removerReceita(id) {
  try {
    console.log(`${colors.cyan}🔐 Fazendo login...${colors.reset}`);
    
    // Login
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      senha: ADMIN_PASSWORD,
    });

    const token = loginResponse.data.access_token;
    console.log(`${colors.green}✅ Login realizado!${colors.reset}\n`);

    // Buscar receita primeiro para confirmar
    console.log(`${colors.cyan}📚 Buscando receita...${colors.reset}`);
    try {
      const receitaResponse = await axios.get(`${API_URL}/receitas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const receita = receitaResponse.data;
      console.log(`   Título: ${receita.titulo}`);
      console.log(`   Status: ${receita.ativa ? 'Ativa' : 'Inativa'}`);
      console.log(`   ID: ${receita.id}\n`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`${colors.yellow}⚠️  Receita não encontrada com este ID${colors.reset}`);
        return;
      }
      throw error;
    }

    // Remover receita
    console.log(`${colors.cyan}🗑️  Removendo receita...${colors.reset}`);
    await axios.delete(`${API_URL}/receitas/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(`${colors.green}✅ Receita removida com sucesso!${colors.reset}\n`);

  } catch (error) {
    if (error.response) {
      console.error(`${colors.red}❌ Erro:${colors.reset}`, error.response.data || error.message);
      console.error(`   Status: ${error.response.status}`);
    } else {
      console.error(`${colors.red}❌ Erro:${colors.reset}`, error.message);
    }
  }
}

// Pegar ID da linha de comando
const receitaId = process.argv[2];

if (!receitaId) {
  console.log(`${colors.yellow}⚠️  Uso: node scripts/remover-receita-por-id.js <ID_DA_RECEITA>${colors.reset}`);
  console.log(`${colors.cyan}Exemplo: node scripts/remover-receita-por-id.js 675bddd6-fd83-4cbe-b90c-fa0f1efc0073${colors.reset}\n`);
  
  // Listar todas as receitas de Hambúrguer para facilitar
  console.log(`${colors.cyan}📋 Buscando receitas de Hambúrguer para facilitar...${colors.reset}\n`);
  
  (async () => {
    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: ADMIN_EMAIL,
        senha: ADMIN_PASSWORD,
      });
      
      const token = loginResponse.data.access_token;
      const receitasResponse = await axios.get(`${API_URL}/receitas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const hamburgueres = receitasResponse.data.filter(r => 
        r.titulo && (r.titulo.includes('Hambúrguer') || r.titulo.includes('Hamburger'))
      );
      
      if (hamburgueres.length > 0) {
        console.log(`${colors.yellow}🍔 Receitas de Hambúrguer encontradas:${colors.reset}`);
        hamburgueres.forEach((r, i) => {
          console.log(`   ${i + 1}. ${r.titulo}`);
          console.log(`      ID: ${r.id}`);
          console.log(`      Status: ${r.ativa ? 'Ativa' : 'Inativa'}`);
          console.log('');
        });
        console.log(`${colors.cyan}💡 Use o ID acima para remover:${colors.reset}`);
        console.log(`${colors.cyan}   node scripts/remover-receita-por-id.js <ID>${colors.reset}\n`);
      } else {
        console.log(`${colors.yellow}⚠️  Nenhuma receita de Hambúrguer encontrada${colors.reset}\n`);
      }
    } catch (error) {
      console.error(`${colors.red}❌ Erro ao buscar receitas:${colors.reset}`, error.message);
    }
  })();
} else {
  removerReceita(receitaId);
}




