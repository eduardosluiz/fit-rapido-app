/**
 * Script para cadastrar a receita "Morangoffe Sem Açúcar"
 * 
 * USO:
 * Execute: node scripts/cadastrar-morangoffe-sem-acucar.js
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

// Receita "Morangoffe Sem Açúcar"
const receita = {
  titulo: '🍓🍨 Morangoffe Sem Açúcar',
  descricao: 'Um doce leve, cremoso e refrescante, perfeito para matar a vontade de sobremesa sem exageros.',
  ingredientes: [
    'Leite Condensado Fit:',
    '2 xícaras de leite em pó',
    '½ xícara de água quente',
    '4 colheres de sopa de adoçante culinário',
    'Creme:',
    '1 caixinha de creme de leite (200 g)',
    'Nata com Morangos:',
    '300 g de nata',
    '3 colheres de sopa de adoçante',
    'Morangos frescos picados a gosto',
    'Finalização (opcional):',
    'Merengues sem açúcar'
  ],
  modo_preparo: [
    'Leite Condensado Fit:',
    'No liquidificador, bata o leite em pó, a água quente e o adoçante até ficar homogêneo.',
    'Transfira para uma panela e leve ao fogo médio, mexendo sempre, até engrossar e desgrudar do fundo.',
    'Retire do fogo e deixe esfriar levemente.',
    'Creme:',
    'No liquidificador, bata o leite condensado fit com o creme de leite até obter um creme liso e bem cremoso.',
    'Despeje em uma travessa e leve à geladeira até esfriar completamente.',
    'Nata com Morangos:',
    'Bata a nata com o adoçante na batedeira até atingir consistência firme.',
    'Incorpore delicadamente os morangos picados.',
    'Montagem:',
    'Sobre o creme já gelado, distribua a nata com morangos.',
    'Finalize com merengues sem açúcar, se desejar.',
    'Leve à geladeira até o momento de servir.'
  ],
  tempo_preparo: 145, // Preparo: 25 minutos + Geladeira: 2 horas (120 min) = 145 minutos
  porcoes: 7, // Média entre 6 a 8 porções
  dificuldade: 'medio',
  tipo_refeicao: 'snacks',
  tags: ['Sobremesa', 'Sem açúcar', 'Mais leve', 'Sem glúten', 'Final de semana'],
  is_premium: true, // Receita PREMIUM por padrão
  is_free: false,
  // Informações nutricionais (por porção - 1/7 da receita, sem merengue)
  calorias: 200, // Média entre 180-220 kcal
  carboidratos: 8, // Média entre 6-10 g
  proteinas: 9, // Média entre 7-10 g (arredondado)
  gorduras: 14, // Média entre 12-15 g (arredondado)
  fibras: null,
  sodio: null,
  informacoes_nutricionais: `Por porção (1/7 da receita, sem merengue)
* Calorias: ~180–220 kcal
* Proteínas: ~7–10 g
* Gorduras: ~12–15 g
* Carboidratos: ~6–10 g

➡️ Valores podem variar conforme:
– adoçante utilizado
– ingredientes utilizados
– quantidade de morangos
– uso de merengues`,
  aviso_nutricional: 'Valores nutricionais estimados via aplicativo e não substituem orientação nutricional profissional.',
  substituicoes_ingredientes: {
    'Leite em pó': ['leite em pó desnatado', 'leite em pó sem lactose'],
    'Nata': ['creme de leite fresco'],
    'Adoçante culinário': ['xilitol', 'eritritol', 'blend culinário'],
    'Morangos': ['frutas vermelhas variadas']
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
    const tituloLimpo = titulo.replace(/[🧊🍋🍫🍓🍞🥞🫐🍓🍫🍗🥚🍞🎃🍫🍓🥕🍞🥚🧀🫐🍆🍫🍓🍽️🥗🥘🍲🍳🥞🧇🍞🥐🥖🥨🥯🥪🌮🌯🥙🥗🥘🍝🍜🍲🍱🍣🍤🍥🥮🍢🍡🍧🍨🍦🥧🍰🎂🍮🍭🍬🍫🍿🍩🍪🌰🥜🍯🥛🍼☕🍵🥤🍶🍺🍻🥂🍷🥃🍸🍹🍾🥡🥢🍴🍽️💪🍌]/g, '').trim();
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
  console.log(`${colors.blue}  🍓🍨 Cadastro de Morangoffe Sem Açúcar${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  console.log(`${colors.cyan}📝 Receita a cadastrar:${colors.reset}`);
  console.log(`   Título: ${receita.titulo}`);
  console.log(`   Ingredientes: ${receita.ingredientes.length}`);
  console.log(`   Modo de Preparo: ${receita.modo_preparo.length} passos`);
  console.log(`   Substituições: ${Object.keys(receita.substituicoes_ingredientes || {}).length} ingredientes`);
  console.log(`   Tags: ${receita.tags.join(', ')}`);
  console.log(`   Calorias: ${receita.calorias} kcal (por porção)`);
  console.log(`   Carboidratos: ${receita.carboidratos} g (por porção)`);
  console.log(`   Proteínas: ${receita.proteinas} g (por porção)`);
  console.log(`   Gorduras: ${receita.gorduras} g (por porção)`);
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
