/**
 * Script para cadastrar apenas a receita do Pudim Rápido na Airfryer
 * Executa login como admin e cadastra a receita diretamente
 */

const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../api/.env') });

// Configurações
const API_URL = process.env.API_URL || 'http://localhost:3001';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fitrapido.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Cores para console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Receita do Pudim
const receitaPudim = {
  titulo: "🍮 Pudim Rápido na Airfryer",
  descricao: "Delicioso, fácil e pronto em apenas 12 minutos! Ideal para um lanche ou sobremesa rápida.",
  ingredientes: [
    "1 ovo",
    "2 colheres de sopa de leite em pó",
    "1 colher de chá de adoçante (ou a gosto)",
    "50 ml de leite (pode ser vegetal ou sem lactose)",
    "Calda opcional: tâmaras, mel ou tradicional"
  ],
  modo_preparo: [
    "Bata todos os ingredientes no mixer ou liquidificador até a mistura ficar bem lisa",
    "Despeje em uma forminha untada com calda (tâmaras, mel ou tradicional)",
    "Leve direto à airfryer e asse a 180 °C por 12 minutos",
    "Retire com cuidado e deixe esfriar completamente antes de desenformar",
    "Para um pudim mais firme e geladinho, leve à geladeira antes de servir"
  ],
  tempo_preparo: 30,
  porcoes: 1,
  dificuldade: "facil",
  tipo_refeicao: "snacks",
  tags: ["pudim", "airfryer", "sobremesa", "fit", "snack", "rápido", "doce fit"],
  is_premium: false,
  is_free: true,
  calorias: 95,
  proteinas: 7,
  carboidratos: 6,
  gorduras: 5
};

async function login() {
  try {
    console.log(`${colors.cyan}🔐 Fazendo login como admin...${colors.reset}`);
    console.log(`${colors.yellow}   Email: ${ADMIN_EMAIL}${colors.reset}`);
    console.log(`${colors.yellow}   API URL: ${API_URL}${colors.reset}`);
    
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      senha: ADMIN_PASSWORD,
    }, {
      timeout: 10000,
    });
    
    if (!response.data.access_token) {
      throw new Error('Token de acesso não recebido');
    }
    
    console.log(`${colors.green}✅ Login realizado com sucesso!${colors.reset}\n`);
    return response.data.access_token;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error(`${colors.red}❌ Erro: Não foi possível conectar à API em ${API_URL}${colors.reset}`);
      console.error(`${colors.yellow}   Certifique-se de que a API está rodando:${colors.reset}`);
      console.error(`${colors.yellow}   cd api && npm run start:dev${colors.reset}`);
    } else if (error.response) {
      console.error(`${colors.red}❌ Erro ao fazer login:${colors.reset}`);
      console.error(`${colors.red}   Status: ${error.response.status}${colors.reset}`);
      console.error(`${colors.red}   Mensagem: ${JSON.stringify(error.response.data)}${colors.reset}`);
      console.error(`${colors.yellow}   Verifique se as credenciais estão corretas no arquivo api/.env${colors.reset}`);
    } else {
      console.error(`${colors.red}❌ Erro ao fazer login:${colors.reset}`, error.message);
    }
    throw error;
  }
}

async function verificarReceitaExistente(token, titulo) {
  try {
    const response = await axios.get(`${API_URL}/receitas`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        search: titulo,
        limit: 10,
      },
    });
    
    if (response.data && Array.isArray(response.data)) {
      const receitaExistente = response.data.find(r => 
        r.titulo && r.titulo.toLowerCase().includes('pudim') && 
        r.titulo.toLowerCase().includes('airfryer')
      );
      return receitaExistente;
    }
    
    return null;
  } catch (error) {
    console.log(`${colors.yellow}⚠️  Não foi possível verificar receitas existentes${colors.reset}`);
    return null;
  }
}

async function cadastrarReceita(token, receita) {
  try {
    console.log(`${colors.blue}📝 Cadastrando receita: ${receita.titulo}${colors.reset}`);
    
    // Separar macros dos outros dados (macros só podem ser adicionados via update)
    const { calorias, proteinas, carboidratos, gorduras, ...dadosReceita } = receita;
    
    // Criar receita sem macros
    const response = await axios.post(
      `${API_URL}/receitas`,
      dadosReceita,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    const receitaCriada = response.data;

    // Se houver macros, atualizar a receita com eles
    if (calorias !== undefined || proteinas !== undefined || carboidratos !== undefined || gorduras !== undefined) {
      console.log(`${colors.cyan}📊 Adicionando informações nutricionais...${colors.reset}`);
      
      const macrosUpdate = {};
      if (calorias !== undefined) macrosUpdate.calorias = calorias;
      if (proteinas !== undefined) macrosUpdate.proteinas = proteinas;
      if (carboidratos !== undefined) macrosUpdate.carboidratos = carboidratos;
      if (gorduras !== undefined) macrosUpdate.gorduras = gorduras;

      await axios.patch(
        `${API_URL}/receitas/${receitaCriada.id}`,
        macrosUpdate,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );
      
      console.log(`${colors.green}✅ Macros adicionados com sucesso!${colors.reset}`);
    }

    return { success: true, data: receitaCriada };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status,
    };
  }
}

async function main() {
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  🍮 Cadastro de Receita - Pudim Airfryer${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  // Fazer login
  let token;
  try {
    token = await login();
  } catch (error) {
    console.error(`${colors.red}❌ Não foi possível fazer login. Verifique as credenciais e se a API está rodando.${colors.reset}`);
    process.exit(1);
  }

  // Verificar se já existe
  console.log(`${colors.cyan}🔍 Verificando se a receita já existe...${colors.reset}`);
  const receitaExistente = await verificarReceitaExistente(token, receitaPudim.titulo);
  
  if (receitaExistente) {
    console.log(`${colors.yellow}⚠️  Receita já cadastrada!${colors.reset}`);
    console.log(`${colors.yellow}   ID: ${receitaExistente.id}${colors.reset}`);
    console.log(`${colors.yellow}   Título: ${receitaExistente.titulo}${colors.reset}`);
    console.log(`${colors.cyan}💡 Você pode adicionar fotos e vídeos pelo painel admin${colors.reset}`);
    process.exit(0);
  }

  // Cadastrar receita
  console.log(`${colors.cyan}🚀 Cadastrando nova receita...${colors.reset}\n`);
  const resultado = await cadastrarReceita(token, receitaPudim);

  if (resultado.success) {
    console.log(`${colors.green}✅ Receita cadastrada com sucesso!${colors.reset}`);
    console.log(`${colors.green}   ID: ${resultado.data.id}${colors.reset}`);
    console.log(`${colors.green}   Título: ${resultado.data.titulo}${colors.reset}\n`);
    console.log(`${colors.cyan}💡 Próximos passos:${colors.reset}`);
    console.log(`${colors.cyan}   1. Acesse o painel admin: http://localhost:3000${colors.reset}`);
    console.log(`${colors.cyan}   2. Vá em Receitas → Editar a receita${colors.reset}`);
    console.log(`${colors.cyan}   3. Adicione as fotos e vídeo${colors.reset}\n`);
  } else {
    console.log(`${colors.red}❌ Erro ao cadastrar receita:${colors.reset}`);
    if (resultado.status === 409) {
      console.log(`${colors.yellow}   Receita já existe no sistema${colors.reset}`);
    } else {
      console.log(`${colors.red}   ${JSON.stringify(resultado.error)}${colors.reset}`);
    }
    process.exit(1);
  }
}

// Executar
main().catch(error => {
  console.error(`${colors.red}❌ Erro fatal:${colors.reset}`, error);
  process.exit(1);
});

