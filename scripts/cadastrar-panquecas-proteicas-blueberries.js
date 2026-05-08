/**
 * Script para cadastrar a receita "Panquecas Proteicas com Blueberries e Doce de Leite"
 * 
 * USO:
 * Execute: node scripts/cadastrar-panquecas-proteicas-blueberries.js
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

// Receita "Panquecas Proteicas com Blueberries e Doce de Leite"
const receita = {
  titulo: '🥞🫐 Panquecas Proteicas com Blueberries e Doce de Leite',
  descricao: 'Macias, levemente doces e com recheio cremoso no centro — perfeitas para começar o dia com prazer e equilíbrio.',
  ingredientes: [
    '1 ovo',
    '2 colheres de sopa de farelo de aveia',
    '1 colher de sopa de whey protein sabor baunilha',
    '1 colher de sopa de queijo cottage',
    '1 colher de chá de essência de baunilha',
    '1 colher de sopa de leite de amêndoas',
    'Blueberries a gosto',
    '½ colher de chá de fermento em pó',
    '½ colher de chá de doce de leite por panqueca',
    'Calda de coco para finalizar (opcional)'
  ],
  modo_preparo: [
    'Em uma tigela, misture o ovo, o farelo de aveia, o whey, o cottage, a baunilha e o leite até obter uma massa homogênea.',
    'Incorpore as blueberries delicadamente.',
    'Acrescente o fermento e misture levemente.',
    'Aqueça uma frigideira antiaderente em fogo baixo e despeje pequenas porções da massa.',
    'Quando as bordas começarem a dourar, coloque ½ colher de chá de doce de leite no centro de cada panqueca.',
    'Vire com cuidado e doure o outro lado.',
    'Finalize com calda de coco, se desejar, e sirva.'
  ],
  tempo_preparo: 15, // Preparo: 5 minutos + Cozimento: 10 minutos = 15 minutos
  porcoes: 4, // 4 panquecas
  dificuldade: 'facil',
  tipo_refeicao: 'breakfast', // Café da manhã
  tags: ['Café da manhã', 'Lanche saudável', 'Proteico', 'Doce equilibrado'],
  is_premium: true, // Receita PREMIUM por padrão
  is_free: false,
  // Informações nutricionais (por panqueca - 1/4 da receita)
  calorias: 100, // Média entre 95-105 kcal por panqueca
  carboidratos: 9, // Média entre 35-40 g total / 4 = ~9 g por panqueca
  proteinas: 7.5, // Média entre 7-8 g por panqueca
  gorduras: 3.75, // Média entre 14-16 g total / 4 = ~3.75 g por panqueca
  fibras: null,
  sodio: null,
  informacoes_nutricionais: `Receita total (4 panquecas):
* Calorias: ~380–420 kcal
* Proteínas: ~28–32 g
* Carboidratos: ~35–40 g
* Gorduras: ~14–16 g

Por panqueca:
* Calorias: ~95–105 kcal
* Proteínas: ~7–8 g

➡️ Valores podem variar conforme marcas e substituições utilizadas.`,
  aviso_nutricional: 'Valores nutricionais estimados e não substituem orientação nutricional profissional.',
  substituicoes_ingredientes: {
    'Farelo de aveia': ['farinha de aveia', 'aveia em flocos finos', 'farinha de amêndoas'],
    'Whey de baunilha': ['whey neutro', 'proteína vegetal', 'leite em pó'],
    'Queijo cottage': ['ricota amassada', 'cream cheese light', 'iogurte grego'],
    'Leite de amêndoas': ['leite de coco', 'leite desnatado', 'água'],
    'Blueberries': ['morango picado', 'framboesa', 'banana em rodelas'],
    'Doce de leite': ['doce de leite sem açúcar', 'pasta de amendoim', 'chocolate 70%'],
    'Calda de coco': ['mel', 'maple zero', 'omitir']
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
    const tituloLimpo = titulo.replace(/[🥞🫐🍓🍫🍗🥚🍞🎃🍫🍓🥕🍞🥚🧀🫐🍆🍫🍓🍽️🥗🥘🍲🍳🥞🧇🍞🥐🥖🥨🥯🥪🌮🌯🥙🥗🥘🍝🍜🍲🍱🍣🍤🍥🥮🍢🍡🍧🍨🍦🥧🍰🎂🍮🍭🍬🍫🍿🍩🍪🌰🥜🍯🥛🍼☕🍵🥤🍶🍺🍻🥂🍷🥃🍸🍹🍾🥡🥢🍴🍽️💪🍌]/g, '').trim();
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
      tipo_refeicao: receita.tipo_refeicao || 'breakfast',
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
  console.log(`${colors.blue}  🥞🫐 Cadastro de Panquecas Proteicas com Blueberries e Doce de Leite${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  console.log(`${colors.cyan}📝 Receita a cadastrar:${colors.reset}`);
  console.log(`   Título: ${receita.titulo}`);
  console.log(`   Ingredientes: ${receita.ingredientes.length}`);
  console.log(`   Modo de Preparo: ${receita.modo_preparo.length} passos`);
  console.log(`   Substituições: ${Object.keys(receita.substituicoes_ingredientes || {}).length} ingredientes`);
  console.log(`   Tags: ${receita.tags.join(', ')}`);
  console.log(`   Calorias: ${receita.calorias} kcal (por panqueca)`);
  console.log(`   Carboidratos: ${receita.carboidratos} g (por panqueca)`);
  console.log(`   Proteínas: ${receita.proteinas} g (por panqueca)`);
  console.log(`   Gorduras: ${receita.gorduras} g (por panqueca)`);
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
