/**
 * Script para testar exclusão de receita
 * Lista todas as receitas e permite testar a exclusão
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

async function testDelete() {
  try {
    console.log(`${colors.cyan}🔐 Fazendo login...${colors.reset}`);
    
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
      params: { incluirInativas: 'true' }
    });

    const receitas = receitasResponse.data;
    console.log(`   Encontradas ${receitas.length} receitas\n`);

    // Filtrar receitas de Hambúrguer
    const hamburgueres = receitas.filter(r => 
      r.titulo && (r.titulo.includes('Hambúrguer') || r.titulo.includes('Hamburger'))
    );

    console.log(`${colors.yellow}🍔 Receitas de Hambúrguer encontradas:${colors.reset}\n`);
    hamburgueres.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.titulo}`);
      console.log(`      ID: ${r.id}`);
      console.log(`      Status: ${r.ativa ? 'Ativa' : 'Inativa'}`);
      console.log(`      Imagem: ${r.imagem_url ? 'Sim' : 'Não'}`);
      console.log('');
    });

    if (hamburgueres.length === 0) {
      console.log(`${colors.yellow}⚠️  Nenhuma receita de Hambúrguer encontrada${colors.reset}`);
      return;
    }

    // Encontrar a receita inativa sem imagem
    const receitaInativa = hamburgueres.find(r => !r.ativa && !r.imagem_url);
    
    if (receitaInativa) {
      console.log(`${colors.cyan}🎯 Testando exclusão da receita inativa sem imagem:${colors.reset}`);
      console.log(`   ID: ${receitaInativa.id}`);
      console.log(`   Título: ${receitaInativa.titulo}\n`);

      try {
        console.log(`${colors.cyan}🗑️  Enviando requisição DELETE...${colors.reset}`);
        const deleteResponse = await axios.delete(`${API_URL}/receitas/${receitaInativa.id}`, {
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: (status) => status === 204 || status < 500 // Aceitar 204 como sucesso
        });

        console.log(`   Status: ${deleteResponse.status}`);
        
        if (deleteResponse.status === 204) {
          console.log(`${colors.green}✅ Receita excluída com sucesso! (204 NO_CONTENT)${colors.reset}\n`);
        } else {
          console.log(`${colors.yellow}⚠️  Status inesperado: ${deleteResponse.status}${colors.reset}\n`);
        }

        // Verificar se foi realmente excluída
        console.log(`${colors.cyan}🔍 Verificando se foi excluída...${colors.reset}`);
        try {
          const checkResponse = await axios.get(`${API_URL}/receitas/${receitaInativa.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log(`${colors.red}❌ Receita ainda existe!${colors.reset}`);
          console.log(`   Título: ${checkResponse.data.titulo}`);
        } catch (checkError) {
          if (checkError.response?.status === 404) {
            console.log(`${colors.green}✅ Confirmado: Receita não existe mais (404)${colors.reset}`);
          } else {
            console.log(`${colors.yellow}⚠️  Erro ao verificar: ${checkError.message}${colors.reset}`);
          }
        }

      } catch (deleteError) {
        console.log(`${colors.red}❌ Erro ao excluir:${colors.reset}`);
        if (deleteError.response) {
          console.log(`   Status: ${deleteError.response.status}`);
          console.log(`   Dados: ${JSON.stringify(deleteError.response.data)}`);
        } else {
          console.log(`   Mensagem: ${deleteError.message}`);
        }
      }
    } else {
      console.log(`${colors.yellow}⚠️  Não foi encontrada uma receita inativa sem imagem${colors.reset}`);
      console.log(`${colors.cyan}💡 Você pode testar excluindo manualmente usando:${colors.reset}`);
      console.log(`${colors.cyan}   node scripts/remover-receita-por-id.js <ID>${colors.reset}\n`);
    }

  } catch (error) {
    console.error(`${colors.red}❌ Erro:${colors.reset}`, error.response?.data || error.message);
  }
}

testDelete();




