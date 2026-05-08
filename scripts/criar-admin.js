/**
 * Script para criar usuário admin no sistema
 * 
 * USO:
 * node scripts/criar-admin.js
 * 
 * Ou configure as variáveis de ambiente:
 * ADMIN_EMAIL=seu-email@admin.com
 * ADMIN_PASSWORD=sua-senha-segura
 * ADMIN_NAME=Seu Nome
 */

const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../api/.env') });

// Configurações
const API_URL = process.env.API_URL || 'http://localhost:3001';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fitrapido.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!'; // Senha padrão mais segura
const ADMIN_NAME = process.env.ADMIN_NAME || 'Administrador';

// Cores para console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

async function criarAdmin() {
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  👤 Criar Usuário Admin${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  try {
    console.log(`${colors.cyan}📝 Dados do admin:${colors.reset}`);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Nome: ${ADMIN_NAME}`);
    console.log(`   API URL: ${API_URL}\n`);

    console.log(`${colors.cyan}🚀 Criando usuário...${colors.reset}`);

    // Criar o usuário (sem role, será USER por padrão)
    const registerResponse = await axios.post(`${API_URL}/auth/register`, {
      email: ADMIN_EMAIL,
      nome: ADMIN_NAME,
      senha: ADMIN_PASSWORD,
    }, {
      timeout: 5000,
    });

    console.log(`${colors.green}✅ Usuário criado com sucesso!${colors.reset}`);
    console.log(`   ID: ${registerResponse.data.user.id}`);
    console.log(`   Email: ${registerResponse.data.user.email}`);
    console.log(`   Role atual: ${registerResponse.data.user.role}\n`);

    // Atualizar role para admin usando o token recebido
    if (registerResponse.data.access_token) {
      console.log(`${colors.cyan}🔄 Atualizando role para admin...${colors.reset}`);
      
      try {
        const updateResponse = await axios.patch(
          `${API_URL}/auth/users/${registerResponse.data.user.id}`,
          { role: 'admin' },
          {
            headers: {
              Authorization: `Bearer ${registerResponse.data.access_token}`,
            },
            timeout: 5000,
          }
        );
        console.log(`${colors.green}✅ Role atualizado para admin!${colors.reset}`);
        console.log(`   Novo role: ${updateResponse.data.role}\n`);
      } catch (updateError) {
        if (updateError.response?.status === 401) {
          console.log(`${colors.yellow}⚠️  Não foi possível atualizar automaticamente (sem permissão)${colors.reset}`);
          console.log(`${colors.yellow}   Isso é normal se não houver admins no sistema ainda${colors.reset}`);
          console.log(`${colors.yellow}   Faça login no admin panel e atualize manualmente${colors.reset}\n`);
        } else {
          console.log(`${colors.yellow}⚠️  Erro ao atualizar role:${colors.reset}`);
          console.log(`${colors.yellow}   ${updateError.response?.data?.message || updateError.message}${colors.reset}`);
          console.log(`${colors.yellow}   Faça login no admin panel e atualize manualmente${colors.reset}\n`);
        }
      }
    }

    console.log(`${colors.green}✅ Pronto! Agora você pode usar essas credenciais para cadastrar receitas${colors.reset}`);
    console.log(`\n${colors.cyan}📝 Adicione ao arquivo api/.env:${colors.reset}`);
    console.log(`   ADMIN_EMAIL=${ADMIN_EMAIL}`);
    console.log(`   ADMIN_PASSWORD=${ADMIN_PASSWORD}\n`);

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error(`${colors.red}❌ Erro: Não foi possível conectar à API em ${API_URL}${colors.reset}`);
      console.error(`${colors.yellow}   Certifique-se de que a API está rodando:${colors.reset}`);
      console.error(`${colors.yellow}   cd api && npm run start:dev${colors.reset}\n`);
    } else if (error.response) {
      if (error.response.status === 409) {
        console.error(`${colors.yellow}⚠️  Usuário já existe!${colors.reset}`);
        console.error(`${colors.yellow}   Email: ${ADMIN_EMAIL}${colors.reset}\n`);
        
        // Tentar fazer login para verificar se é admin
        try {
          const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            senha: ADMIN_PASSWORD,
          });
          
          console.log(`${colors.green}✅ Login realizado com sucesso!${colors.reset}`);
          console.log(`   Role atual: ${loginResponse.data.user.role}\n`);
          
          if (loginResponse.data.user.role !== 'admin') {
            console.log(`${colors.yellow}⚠️  Usuário existe mas não é admin${colors.reset}`);
            console.log(`${colors.yellow}   Use o admin panel para atualizar o role para 'admin'${colors.reset}\n`);
          } else {
            console.log(`${colors.green}✅ Usuário já é admin! Pode usar essas credenciais${colors.reset}\n`);
          }
        } catch (loginError) {
          console.error(`${colors.red}❌ Senha incorreta ou usuário não pode fazer login${colors.reset}`);
          console.error(`${colors.yellow}   Verifique a senha ou crie um novo usuário com outro email${colors.reset}\n`);
        }
      } else {
        console.error(`${colors.red}❌ Erro ao criar usuário:${colors.reset}`);
        console.error(`${colors.red}   Status: ${error.response.status}${colors.reset}`);
        console.error(`${colors.red}   Mensagem: ${JSON.stringify(error.response.data)}${colors.reset}\n`);
      }
    } else {
      console.error(`${colors.red}❌ Erro:${colors.reset}`, error.message);
    }
  }
}

// Executar
criarAdmin().catch(error => {
  console.error(`${colors.red}❌ Erro fatal:${colors.reset}`, error);
  process.exit(1);
});

