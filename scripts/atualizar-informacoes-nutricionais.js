/**
 * Script para atualizar informações nutricionais de uma receita existente
 * 
 * USO: node scripts/atualizar-informacoes-nutricionais.js <ID_RECEITA>
 */

const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../api/.env') });

const API_URL = process.env.API_URL || 'http://localhost:3001';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fitrapido.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

async function atualizarInformacoesNutricionais(receitaId, informacoesNutricionais) {
  try {
    console.log(`${colors.cyan}🔐 Fazendo login...${colors.reset}`);
    
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      senha: ADMIN_PASSWORD,
    });

    const token = loginResponse.data.access_token;
    console.log(`${colors.green}✅ Login realizado!${colors.reset}\n`);

    console.log(`${colors.cyan}📝 Atualizando informações nutricionais...${colors.reset}`);
    console.log(`   Receita ID: ${receitaId}`);
    console.log(`   Informações:\n${informacoesNutricionais}\n`);

    await axios.patch(
      `${API_URL}/receitas/${receitaId}`,
      { informacoes_nutricionais: informacoesNutricionais },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`${colors.green}✅ Informações nutricionais atualizadas com sucesso!${colors.reset}\n`);

  } catch (error) {
    if (error.response) {
      console.error(`${colors.red}❌ Erro:${colors.reset}`, error.response.data || error.message);
      console.error(`   Status: ${error.response.status}`);
    } else {
      console.error(`${colors.red}❌ Erro:${colors.reset}`, error.message);
    }
  }
}

// Informações nutricionais da receita "Super Mistura de Sementes"
const informacoesNutricionais = `Por porção (1 colher de sopa cheia)
* Calorias: ~55–65 kcal
* Carboidratos: ~3–4 g
* Proteínas: ~2–3 g
* Gorduras: ~4–5 g
* Fibras: ~2–3 g`;

const receitaId = process.argv[2] || '51da0a68-b64f-4c43-8e8a-a50fbd2cd7ac'; // ID da Super Mistura de Sementes

atualizarInformacoesNutricionais(receitaId, informacoesNutricionais);
