/**
 * Script interativo para testar login
 * Mais fácil de usar - pergunta email e senha
 */

const readline = require('readline');
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function testLogin() {
  try {
    console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}  🔐 Teste de Login${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

    const email = await question(`${colors.yellow}Email: ${colors.reset}`);
    const senha = await question(`${colors.yellow}Senha: ${colors.reset}`);

    console.log(`\n${colors.cyan}🔐 Testando login...${colors.reset}`);
    console.log(`   Email: ${email}\n`);

    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      senha,
    }, {
      validateStatus: (status) => status < 500,
    });

    if (response.status === 200) {
      console.log(`${colors.green}✅ Login bem-sucedido!${colors.reset}`);
      console.log(`   Token: ${response.data.access_token ? '✅ Presente' : '❌ Ausente'}`);
      console.log(`   User ID: ${response.data.user?.id || 'N/A'}`);
      console.log(`   User Email: ${response.data.user?.email || 'N/A'}`);
      console.log(`   User Name: ${response.data.user?.nome || 'N/A'}\n`);
      console.log(`${colors.green}✅ Use essas credenciais no app mobile!${colors.reset}\n`);
    } else {
      console.log(`${colors.red}❌ Login falhou${colors.reset}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Mensagem: ${response.data?.message || 'N/A'}\n`);
      
      if (response.status === 401) {
        console.log(`${colors.yellow}💡 Dica: Verifique se o email e senha estão corretos${colors.reset}`);
        console.log(`${colors.yellow}   Se esqueceu a senha, você pode criar um novo usuário ou resetar${colors.reset}\n`);
      }
    }

  } catch (error) {
    if (error.response) {
      console.log(`${colors.red}❌ Erro na resposta:${colors.reset}`);
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Mensagem: ${error.response.data?.message || 'N/A'}`);
    } else if (error.request) {
      console.log(`${colors.red}❌ Erro de conexão:${colors.reset}`);
      console.log(`   Não foi possível conectar à API em ${API_URL}`);
      console.log(`   Certifique-se de que a API está rodando (npm run start:dev na pasta api)`);
    } else {
      console.log(`${colors.red}❌ Erro:${colors.reset}`, error.message);
    }
  } finally {
    rl.close();
  }
}

testLogin();




