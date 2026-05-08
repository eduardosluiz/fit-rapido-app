/**
 * Script para testar login e verificar resposta da API
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

async function testLogin(email, senha) {
  try {
    console.log(`${colors.cyan}🔐 Testando login...${colors.reset}`);
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${senha.substring(0, 3)}***\n`);

    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      senha,
    }, {
      validateStatus: (status) => status < 500, // Não lançar erro para 4xx
    });

    console.log(`   Status: ${response.status}`);
    console.log(`   Headers:`, JSON.stringify(response.headers, null, 2));
    console.log(`   Data:`, JSON.stringify(response.data, null, 2));

    if (response.status === 200) {
      console.log(`\n${colors.green}✅ Login bem-sucedido!${colors.reset}`);
      console.log(`   Token: ${response.data.access_token ? 'Presente' : 'Ausente'}`);
      console.log(`   User ID: ${response.data.user?.id || 'N/A'}`);
      console.log(`   User Email: ${response.data.user?.email || 'N/A'}`);
    } else {
      console.log(`\n${colors.red}❌ Login falhou${colors.reset}`);
      console.log(`   Mensagem: ${response.data?.message || 'N/A'}`);
    }

  } catch (error) {
    if (error.response) {
      console.log(`\n${colors.red}❌ Erro na resposta:${colors.reset}`);
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log(`\n${colors.red}❌ Erro de conexão:${colors.reset}`);
      console.log(`   Não foi possível conectar à API em ${API_URL}`);
      console.log(`   Certifique-se de que a API está rodando`);
    } else {
      console.log(`\n${colors.red}❌ Erro:${colors.reset}`, error.message);
    }
  }
}

// Pegar email e senha da linha de comando ou usar padrão
const email = process.argv[2] || 'dudemkt@gmail.com';
const senha = process.argv[3];

if (!senha) {
  console.log(`${colors.yellow}⚠️  Uso: node scripts/test-login-mobile.js <email> <senha>${colors.reset}`);
  console.log(`${colors.yellow}   Exemplo: node scripts/test-login-mobile.js dudemkt@gmail.com minhaSenha123${colors.reset}`);
  console.log(`${colors.yellow}   IMPORTANTE: Substitua <email> e <senha> pelos valores reais (sem os símbolos < >)${colors.reset}\n`);
  console.log(`${colors.cyan}💡 Dica: Se sua senha tiver espaços, coloque entre aspas:${colors.reset}`);
  console.log(`${colors.cyan}   node scripts/test-login-mobile.js dudemkt@gmail.com "minha senha com espaços"${colors.reset}\n`);
  process.exit(1);
}

testLogin(email, senha);

