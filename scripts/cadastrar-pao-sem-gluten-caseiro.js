/**
 * Script para cadastrar a receita "Pão Sem Glúten Caseiro"
 * 
 * USO:
 * Execute: node scripts/cadastrar-pao-sem-gluten-caseiro.js
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

// Receita "Pão Sem Glúten Caseiro"
const receita = {
  titulo: '🍞 Pão Sem Glúten Caseiro',
  descricao: 'Macio por dentro, levemente crocante por fora e perfeito para o dia a dia — ideal para sanduíches, torradas ou acompanhar refeições.',
  ingredientes: [
    '2 xícaras de farinha de arroz',
    '1 xícara de fécula de batata',
    '½ xícara de polvilho doce',
    '1 colher de sopa de fermento biológico seco',
    '1 colher de sopa de goma xantana',
    '1 colher de chá de sal',
    '1 colher de chá de açúcar',
    '1¼ xícara de água morna',
    '2 ovos grandes',
    '2 colheres de sopa de azeite de oliva',
    'Gergelim ou sementes para decorar (opcional)'
  ],
  modo_preparo: [
    'Em uma tigela grande, misture todos os ingredientes secos.',
    'Em outro recipiente, misture a água morna, os ovos e o azeite.',
    'Incorpore os líquidos aos secos, mexendo até obter uma massa homogênea, mais mole e levemente pegajosa.',
    'Cubra com um pano e deixe descansar em local morno por cerca de 1 hora, até dobrar de volume.',
    'Preaqueça o forno a 220 °C.',
    'Forre uma assadeira com papel manteiga ou tapete de silicone.',
    'Modele um pão único ou divida em pãezinhos.',
    'Faça cortes leves, se desejar, e finalize com sementes.',
    'Asse por 25–30 minutos, até dourar.',
    'Retire do forno e deixe esfriar sobre uma grade antes de servir.'
  ],
  tempo_preparo: 103, // Preparo: 15 minutos + Descanso: 1 hora (60 min) + Forno: 25–30 minutos (média 27.5) = ~102.5 minutos (arredondado para 103)
  porcoes: 10, // 8 a 10 pães pequenos (usando 10 como padrão)
  dificuldade: 'medio',
  tipo_refeicao: 'sides', // Pães
  tags: ['Pães', 'Sem glúten', 'Base neutra', 'Versátil'],
  is_premium: true, // Receita PREMIUM por padrão
  is_free: false,
  // Informações nutricionais (por unidade - 1 pãozinho de 10)
  calorias: 183, // Média entre 175-190 kcal
  carboidratos: 31, // Média entre 30-32 g
  proteinas: 4.5, // Média entre 4-5 g
  gorduras: 4.5, // Média entre 4-5 g
  fibras: null,
  sodio: null,
  informacoes_nutricionais: `Por unidade (10 pãezinhos):
* Calorias: ~175–190 kcal
* Carboidratos: ~30–32 g
* Proteínas: ~4–5 g
* Gorduras: ~4–5 g

➡️ Valores podem variar conforme marcas e substituições utilizadas.`,
  aviso_nutricional: 'Valores nutricionais estimados e não substituem orientação profissional.',
  substituicoes_ingredientes: {
    'Farinha de arroz': ['farinha de sorgo', 'farinha de aveia sem glúten'],
    'Fécula de batata': ['amido de milho'],
    'Polvilho doce': ['polvilho azedo (textura levemente diferente)'],
    'Açúcar': ['xilitol', 'demerara', 'açúcar de coco'],
    'Ovos': ['2 "ovos" de linhaça (2 col. sopa linhaça + 6 col. sopa água) (textura um pouco mais densa)'],
    'Azeite': ['óleo de coco', 'óleo vegetal'],
    'Gergelim': ['chia', 'linhaça', 'sementes de girassol', 'sementes de abóbora']
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
    const tituloLimpo = titulo.replace(/[🍞🥞🫐🍓🍫🍗🥚🍞🎃🍫🍓🥕🍞🥚🧀🫐🍆🍫🍓🍽️🥗🥘🍲🍳🥞🧇🍞🥐🥖🥨🥯🥪🌮🌯🥙🥗🥘🍝🍜🍲🍱🍣🍤🍥🥮🍢🍡🍧🍨🍦🥧🍰🎂🍮🍭🍬🍫🍿🍩🍪🌰🥜🍯🥛🍼☕🍵🥤🍶🍺🍻🥂🍷🥃🍸🍹🍾🥡🥢🍴🍽️💪🍌]/g, '').trim();
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
      tipo_refeicao: receita.tipo_refeicao || 'sides',
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
  console.log(`${colors.blue}  🍞 Cadastro de Pão Sem Glúten Caseiro${colors.reset}`);
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
  console.log(`   Tempo de preparo: ${receita.tempo_preparo} minutos (~${Math.round(receita.tempo_preparo / 60)}h${receita.tempo_preparo % 60}min)`);
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
