/**
 * Script para promover usuário para admin
 * Usa o token do usuário recém-criado para atualizar o próprio role
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

async function promoverAdmin() {
  console.log(`${colors.cyan}🔐 Fazendo login...${colors.reset}`);
  
  try {
    // Fazer login
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      senha: ADMIN_PASSWORD,
    });

    const token = loginResponse.data.access_token;
    const userId = loginResponse.data.user.id;

    console.log(`${colors.green}✅ Login realizado!${colors.reset}`);
    console.log(`   User ID: ${userId}\n`);

    // Atualizar role para admin
    console.log(`${colors.cyan}🔄 Promovendo para admin...${colors.reset}`);
    
    try {
      const updateResponse = await axios.patch(
        `${API_URL}/auth/users/${userId}`,
        { role: 'admin' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(`${colors.green}✅ Usuário promovido para admin!${colors.reset}`);
      console.log(`   Email: ${updateResponse.data.email}`);
      console.log(`   Role: ${updateResponse.data.role}\n`);

      console.log(`${colors.green}✅ Pronto! Agora você pode cadastrar receitas${colors.reset}`);
      console.log(`\n${colors.cyan}Execute: node scripts/cadastrar-receitas.js${colors.reset}\n`);
    } catch (updateError) {
      console.error(`${colors.red}❌ Erro ao atualizar role:${colors.reset}`);
      console.error(`   Status: ${updateError.response?.status}`);
      console.error(`   Mensagem: ${JSON.stringify(updateError.response?.data || updateError.message)}`);
      
      if (updateError.response?.status === 401) {
        console.error(`\n${colors.yellow}⚠️  Token expirado ou inválido${colors.reset}`);
      } else if (updateError.response?.status === 403) {
        console.error(`\n${colors.yellow}⚠️  Acesso negado - já existe admin no sistema${colors.reset}`);
      }
    }

  } catch (error) {
    if (error.response?.status === 401) {
      console.error(`${colors.red}❌ Credenciais inválidas${colors.reset}`);
      console.error(`${colors.yellow}   Verifique o email e senha em api/.env${colors.reset}`);
      console.error(`${colors.yellow}   Email usado: ${ADMIN_EMAIL}${colors.reset}\n`);
      console.error(`${colors.yellow}   Dica: A senha criada foi "Admin123!"${colors.reset}`);
      console.error(`${colors.yellow}   Certifique-se de que api/.env tem ADMIN_PASSWORD=Admin123!${colors.reset}\n`);
    } else {
      console.error(`${colors.red}❌ Erro:${colors.reset}`, error.response?.data || error.message);
    }
  }
}

promoverAdmin();

