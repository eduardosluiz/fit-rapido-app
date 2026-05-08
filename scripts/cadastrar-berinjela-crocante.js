/**
 * Script para cadastrar a receita "Berinjela Crocante com Parmesão"
 * 
 * USO:
 * Execute: node scripts/cadastrar-berinjela-crocante.js
 * 
 * O script:
 * - Verifica se a receita já existe (não duplica)
 * - Cadastra via API com todos os campos nutricionais
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

// Receita "Berinjela Crocante com Parmesão"
const receita = {
  titulo: '🍆 Berinjela Crocante com Parmesão',
  descricao: 'Fatias de berinjela empanadas, crocantes por fora, macias por dentro e com finalização opcional de queijo, tomate e manjericão.',
  ingredientes: [
    '1 berinjela média',
    '2 colheres de sopa de farinha de amêndoa',
    '2 colheres de sopa de queijo parmesão ralado',
    '1 ovo',
    'Pimenta-do-reino a gosto',
    'Spray de abacate, óleo de coco ou azeite de oliva (opcional)',
    'Finalização (opcional):',
    'Queijo sem lactose a gosto',
    'Tomate fatiado ou em cubos',
    'Manjericão fresco'
  ],
  modo_preparo: [
    'Lave a berinjela e seque bem.',
    'Corte em rodelas ou fatias.',
    'Bata o ovo em um prato e, em outro recipiente, misture a farinha de amêndoa, o parmesão e a pimenta.',
    'Passe as fatias de berinjela no ovo e depois na mistura seca, pressionando levemente.',
    'Disponha em assadeira ou cesto da airfryer.',
    'Se desejar, borrife levemente o óleo para mais crocância.',
    'Asse no forno ou na airfryer a 180 °C por 15–20 minutos, virando na metade do tempo.',
    'Para finalizar, acrescente queijo, tomate e manjericão e volte ao forno por alguns minutos até derreter.'
  ],
  tempo_preparo: 27, // Preparo: 10 minutos + Cozimento: 15-20 minutos (média 17.5) = ~28 minutos
  porcoes: 2, // 1 a 2 porções (usando 2 como padrão)
  dificuldade: 'facil',
  tipo_refeicao: 'snacks', // Lanche saudável / Refeição leve
  tags: ['Lanche saudável', 'Refeição leve', 'Low carb', 'Vegetariano'],
  is_premium: true, // Receita PREMIUM por padrão
  is_free: false,
  // Informações nutricionais (por porção)
  calorias: 200, // Média entre 180-220 kcal
  carboidratos: 9, // Média entre 8-10 g
  proteinas: 10, // Média entre 9-11 g
  gorduras: 13, // Média entre 12-14 g
  fibras: null,
  sodio: null,
  informacoes_nutricionais: `Por porção
* Calorias: ~180–220 kcal
* Carboidratos: ~8–10 g
* Proteínas: ~9–11 g
* Gorduras: ~12–14 g

➡️ Valores podem variar conforme:
– espessura das fatias
– tipo de queijo
– método de preparo`,
  aviso_nutricional: 'Valores nutricionais estimados via aplicativo e não substituem orientação nutricional profissional.',
  substituicoes_ingredientes: {
    'Farinha de amêndoa': ['farinha de castanha de caju', 'farinha de linhaça dourada', 'farinha de coco (usar apenas 1 colher de sopa)'],
    'Parmesão': ['muçarela ralada', 'grana padano', 'levedura nutricional (opção sem lactose)'],
    'Ovo': ['iogurte natural', 'bebida vegetal mais espessa (para empanar, versão sem ovo)'],
    'Spray de abacate / óleo de coco / azeite': ['manteiga ghee'],
    'Queijo sem lactose (finalização)': ['não usar', 'substituir por mais parmesão', 'levedura nutricional']
  }
};

async function login() {
  try {
    console.log(`${colors.cyan}🔐 Fazendo login como admin...${colors.reset}`);
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      senha: ADMIN_PASSWORD,
    }, { timeout: 5000 });
    
    if (!response.data.access_token) {
      throw new Error('Token de acesso não recebido');
    }
    
    console.log(`${colors.green}✅ Login realizado com sucesso!${colors.reset}`);
    return response.data.access_token;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error(`${colors.red}❌ Erro: Não foi possível conectar à API em ${API_URL}${colors.reset}`);
      console.error(`${colors.yellow}   Certifique-se de que a API está rodando${colors.reset}`);
    } else {
      console.error(`${colors.red}❌ Erro ao fazer login:${colors.reset}`, error.response?.data || error.message);
    }
    throw error;
  }
}

async function verificarReceitaExistente(token, titulo) {
  try {
    const tituloLimpo = titulo.replace(/[🍆🍫🍓🍽️🥗🥘🍲🍳🥞🧇🍞🥐🥖🥨🥯🥪🌮🌯🥙🥗🥘🍝🍜🍲🍱🍣🍤🍥🥮🍢🍡🍧🍨🍦🥧🍰🎂🍮🍭🍬🍫🍿🍩🍪🌰🥜🍯🥛🍼☕🍵🥤🍶🍺🍻🥂🍷🥃🍸🍹🍾🥡🥢🍴🍽️💪🍌]/g, '').trim();
    const searchTerm = encodeURIComponent(tituloLimpo);
    
    const response = await axios.get(
      `${API_URL}/receitas?search=${searchTerm}&incluirInativas=true`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (Array.isArray(response.data) && response.data.length > 0) {
      const receitaExistente = response.data.find(
        r => r.titulo && r.titulo.toLowerCase().trim() === titulo.toLowerCase().trim()
      );
      
      if (receitaExistente) {
        return { existe: true, receita: receitaExistente };
      }
    }

    return { existe: false };
  } catch (error) {
    console.log(`${colors.yellow}  ⚠️  Erro ao verificar receita existente: ${error.message}${colors.reset}`);
    return { existe: false };
  }
}

async function criarReceita(token, receita) {
  try {
    // Verificar se já existe
    const verificacao = await verificarReceitaExistente(token, receita.titulo);
    if (verificacao.existe) {
      return {
        success: false,
        error: `Receita já existe com ID: ${verificacao.receita.id}`,
        receita: receita.titulo,
        duplicata: true,
      };
    }

    // Preparar dados
    const dadosReceita = {
      titulo: receita.titulo,
      descricao: receita.descricao || '',
      ingredientes: receita.ingredientes || [],
      modo_preparo: receita.modo_preparo || [],
      tempo_preparo: receita.tempo_preparo || 0,
      porcoes: receita.porcoes || 1,
      dificuldade: receita.dificuldade || 'medio',
      tipo_refeicao: receita.tipo_refeicao || 'snacks',
      tags: receita.tags || [],
      is_premium: receita.is_premium !== undefined ? receita.is_premium : true, // Padrão: PREMIUM
      is_free: receita.is_free !== undefined ? receita.is_free : false,
      informacoes_nutricionais: receita.informacoes_nutricionais || '',
      aviso_nutricional: receita.aviso_nutricional || '',
      substituicoes_ingredientes: receita.substituicoes_ingredientes || {},
    };

    // Remover campos undefined/null/vazios
    Object.keys(dadosReceita).forEach(key => {
      if (dadosReceita[key] === undefined || dadosReceita[key] === null || 
          (Array.isArray(dadosReceita[key]) && dadosReceita[key].length === 0) ||
          (typeof dadosReceita[key] === 'string' && dadosReceita[key].trim() === '') ||
          (typeof dadosReceita[key] === 'object' && !Array.isArray(dadosReceita[key]) && Object.keys(dadosReceita[key]).length === 0)) {
        delete dadosReceita[key];
      }
    });

    console.log(`${colors.cyan}📝 Cadastrando receita: ${receita.titulo}${colors.reset}`);
    const response = await axios.post(
      `${API_URL}/receitas`,
      dadosReceita,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Atualizar dados nutricionais numéricos após criação
    if (receita.calorias !== null && receita.calorias !== undefined ||
        receita.proteinas !== null && receita.proteinas !== undefined ||
        receita.carboidratos !== null && receita.carboidratos !== undefined ||
        receita.gorduras !== null && receita.gorduras !== undefined ||
        receita.fibras !== null && receita.fibras !== undefined ||
        receita.sodio !== null && receita.sodio !== undefined) {
      
      const dadosNutricionais = {};
      if (receita.calorias !== null && receita.calorias !== undefined) dadosNutricionais.calorias = receita.calorias;
      if (receita.proteinas !== null && receita.proteinas !== undefined) dadosNutricionais.proteinas = receita.proteinas;
      if (receita.carboidratos !== null && receita.carboidratos !== undefined) dadosNutricionais.carboidratos = receita.carboidratos;
      if (receita.gorduras !== null && receita.gorduras !== undefined) dadosNutricionais.gorduras = receita.gorduras;
      if (receita.fibras !== null && receita.fibras !== undefined) dadosNutricionais.fibras = receita.fibras;
      if (receita.sodio !== null && receita.sodio !== undefined) dadosNutricionais.sodio = receita.sodio;

      try {
        await axios.patch(
          `${API_URL}/receitas/${response.data.id}`,
          dadosNutricionais,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        console.log(`${colors.green}  ✅ Dados nutricionais atualizados${colors.reset}`);
      } catch (updateError) {
        console.log(`${colors.yellow}  ⚠️  Receita criada, mas erro ao atualizar dados nutricionais: ${updateError.message}${colors.reset}`);
      }
    }

    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      receita: receita.titulo,
    };
  }
}

async function main() {
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  🍆 Cadastro de Berinjela Crocante com Parmesão${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  console.log(`${colors.cyan}📝 Receita a cadastrar:${colors.reset}`);
  console.log(`   Título: ${receita.titulo}`);
  console.log(`   Ingredientes: ${receita.ingredientes.length}`);
  console.log(`   Modo de Preparo: ${receita.modo_preparo.length} passos`);
  console.log(`   Substituições: ${Object.keys(receita.substituicoes_ingredientes || {}).length} ingredientes`);
  console.log(`   Tags: ${receita.tags.join(', ')}`);
  console.log(`   Calorias: ${receita.calorias} kcal`);
  console.log(`   Carboidratos: ${receita.carboidratos} g`);
  console.log(`   Proteínas: ${receita.proteinas} g`);
  console.log(`   Gorduras: ${receita.gorduras} g`);
  console.log(`   Status: ${receita.is_premium ? 'PREMIUM' : 'FREE'}\n`);

  // Login
  let token;
  try {
    token = await login();
  } catch (error) {
    console.error(`${colors.red}❌ Não foi possível fazer login.${colors.reset}`);
    return;
  }

  // Cadastrar
  console.log(`${colors.cyan}🚀 Cadastrando receita...${colors.reset}\n`);
  const resultado = await criarReceita(token, receita);

  if (resultado.success) {
    console.log(`${colors.green}✅ Receita cadastrada com sucesso!${colors.reset}`);
    console.log(`   ID: ${resultado.data.id}`);
    console.log(`   Título: ${resultado.data.titulo}`);
    console.log(`   Status: ${receita.is_premium ? 'PREMIUM' : 'FREE'}\n`);
  } else if (resultado.duplicata) {
    console.log(`${colors.yellow}⚠️  Receita já existe!${colors.reset}`);
    console.log(`   ${resultado.error}\n`);
  } else {
    console.log(`${colors.red}❌ Erro ao cadastrar:${colors.reset}`);
    console.log(`   ${JSON.stringify(resultado.error, null, 2)}\n`);
  }
}

main().catch(error => {
  console.error(`${colors.red}❌ Erro fatal:${colors.reset}`, error);
  process.exit(1);
});
