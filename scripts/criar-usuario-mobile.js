/**
 * Script para criar usuário para uso no mobile
 * 
 * Uso: node scripts/criar-usuario-mobile.js
 */

const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../api/.env') });

const API_URL = process.env.API_URL || 'http://localhost:3001';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

async function criarUsuario() {
  try {
    console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}  👤 Criar Usuário para Mobile${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

    const email = 'dudemkt@gmail.com';
    const nome = 'Usuário Mobile';
    const senha = 'Senha123!'; // Senha padrão fácil de lembrar

    console.log(`${colors.cyan}📝 Dados do usuário:${colors.reset}`);
    console.log(`   Email: ${email}`);
    console.log(`   Nome: ${nome}`);
    console.log(`   Senha: ${senha}\n`);

    console.log(`${colors.cyan}🚀 Criando usuário...${colors.reset}`);

    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      nome,
      senha,
    });

    console.log(`${colors.green}✅ Usuário criado com sucesso!${colors.reset}`);
    console.log(`   ID: ${response.data.user.id}`);
    console.log(`   Email: ${response.data.user.email}`);
    console.log(`   Token: ${response.data.access_token ? '✅ Recebido' : '❌ Não recebido'}\n`);

    console.log(`${colors.green}✅ Use essas credenciais no app mobile:${colors.reset}`);
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${senha}\n`);

  } catch (error) {
    if (error.response?.status === 409) {
      console.log(`${colors.yellow}⚠️  Usuário já existe!${colors.reset}`);
      console.log(`${colors.yellow}   Email: ${error.config.data ? JSON.parse(error.config.data).email : 'N/A'}${colors.reset}\n`);
      
      console.log(`${colors.cyan}💡 Opções:${colors.reset}`);
      console.log(`   1. Use a senha padrão: Senha123!`);
      console.log(`   2. Ou execute SQL no Supabase para resetar:`);
      console.log(`      UPDATE usuarios SET senha_hash = '$2b$10$...' WHERE email = 'dudemkt@gmail.com';`);
      console.log(`      (Precisa gerar hash bcrypt da nova senha)\n`);
      
      // Tentar fazer login com senha padrão
      console.log(`${colors.cyan}🔐 Testando login com senha padrão...${colors.reset}`);
      try {
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
          email: 'dudemkt@gmail.com',
          senha: 'Senha123!',
        });
        console.log(`${colors.green}✅ Login bem-sucedido com senha padrão!${colors.reset}\n`);
      } catch (loginError) {
        console.log(`${colors.red}❌ Senha padrão não funciona${colors.reset}`);
        console.log(`${colors.yellow}   Você precisa resetar a senha manualmente${colors.reset}\n`);
      }
    } else {
      console.error(`${colors.red}❌ Erro:${colors.reset}`, error.response?.data || error.message);
    }
  }
}

criarUsuario();




