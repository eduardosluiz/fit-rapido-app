const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../api/.env') });

const API_URL = process.env.API_URL || 'http://localhost:3001';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fitrapido.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const colors = {
  reset: '\x1b[0m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      senha: ADMIN_PASSWORD,
    });

    if (!response.data.access_token) {
      throw new Error('Token de acesso não recebido');
    }

    console.log(`${colors.green}✅ Login realizado com sucesso!${colors.reset}`);
    return response.data.access_token;
  } catch (error) {
    console.error(`${colors.red}❌ Erro ao fazer login:${colors.reset}`, error.response?.data || error.message);
    throw error;
  }
}

async function buscarTodasReceitas(token) {
  try {
    const response = await axios.get(`${API_URL}/receitas?incluirInativas=true`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(`${colors.red}❌ Erro ao buscar receitas:${colors.reset}`, error.response?.data || error.message);
    throw error;
  }
}

async function alterarReceitaParaPremium(token, receitaId, titulo) {
  try {
    await axios.patch(
      `${API_URL}/receitas/${receitaId}`,
      {
        is_premium: true,
        is_free: false,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return true;
  } catch (error) {
    console.error(`${colors.red}❌ Erro ao alterar receita ${titulo}:${colors.reset}`, error.response?.data || error.message);
    return false;
  }
}

async function main() {
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  🔄 Alterar Todas Receitas para PREMIUM${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  try {
    // Login
    console.log(`${colors.cyan}🔐 Fazendo login como admin...${colors.reset}`);
    const token = await login();

    // Buscar todas as receitas
    console.log(`${colors.cyan}📋 Buscando todas as receitas...${colors.reset}`);
    const receitas = await buscarTodasReceitas(token);

    console.log(`${colors.green}✅ Encontradas ${receitas.length} receitas${colors.reset}`);
    console.log(`   Receitas PREMIUM: ${receitas.filter(r => r.is_premium).length}`);
    console.log(`   Receitas FREE: ${receitas.filter(r => r.is_free).length}\n`);

    // Filtrar apenas receitas que não são PREMIUM ou que são FREE
    const receitasParaAlterar = receitas.filter(r => !r.is_premium || r.is_free);
    console.log(`${colors.cyan}🔄 Receitas que precisam ser alteradas: ${receitasParaAlterar.length}${colors.reset}\n`);

    if (receitasParaAlterar.length === 0) {
      console.log(`${colors.yellow}⚠️  Todas as receitas já são PREMIUM!${colors.reset}`);
      return;
    }

    // Alterar cada receita
    let sucesso = 0;
    let erro = 0;

    for (let i = 0; i < receitasParaAlterar.length; i++) {
      const receita = receitasParaAlterar[i];
      const progresso = `[${i + 1}/${receitasParaAlterar.length}]`;
      
      console.log(`${colors.cyan}${progresso} Alterando: ${receita.titulo.substring(0, 60)}...${colors.reset}`);
      
      const resultado = await alterarReceitaParaPremium(token, receita.id, receita.titulo);
      
      if (resultado) {
        sucesso++;
        console.log(`${colors.green}  ✅ Alterada com sucesso${colors.reset}`);
      } else {
        erro++;
        console.log(`${colors.red}  ❌ Erro ao alterar${colors.reset}`);
      }

      // Pequeno delay para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
    console.log(`${colors.blue}  📊 Resumo${colors.reset}`);
    console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);
    console.log(`   Total de receitas: ${receitas.length}`);
    console.log(`   Receitas alteradas: ${sucesso}`);
    console.log(`   Erros: ${erro}`);
    console.log(`\n${colors.green}✅ Processo concluído!${colors.reset}`);
    console.log(`${colors.yellow}💡 Agora você pode selecionar manualmente as 25 receitas que serão FREE${colors.reset}\n`);

  } catch (error) {
    console.error(`${colors.red}❌ Erro fatal:${colors.reset}`, error.message);
    process.exit(1);
  }
}

main();
