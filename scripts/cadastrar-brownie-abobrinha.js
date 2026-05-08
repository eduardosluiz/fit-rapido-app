/**
 * Script para cadastrar a receita "Brownie de Abobrinha com Chocolate"
 * 
 * USO:
 * Execute: node scripts/cadastrar-brownie-abobrinha.js
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

// Receita "Brownie de Abobrinha com Chocolate"
const receita = {
  titulo: '🥒🍫 Brownie de Abobrinha com Chocolate',
  descricao: 'Úmido, intenso e surpreendentemente leve, esse brownie une sabor de chocolate com ingredientes funcionais — sem gosto de abobrinha.',
  ingredientes: [
    '1 xícara de abobrinha ralada',
    '2 colheres de sopa de óleo de coco derretido (sem sabor)',
    '2 ovos',
    '100 g de chocolate sem açúcar',
    '½ xícara de cacau em pó sem açúcar',
    '4 colheres de sopa de farinha de amêndoas (ou outra de sua preferência)',
    '½ xícara de açúcar mascavo ou adoçante culinário de sua escolha',
    '1 colher de chá de extrato de baunilha',
    '½ colher de chá de bicarbonato de sódio',
    '1 pitada de sal',
    '¼ xícara de chocolate amargo picado (opcional)'
  ],
  modo_preparo: [
    'Prequeça o forno a 180 °C e unte uma forma pequena ou forre com papel manteiga.',
    'Na batedeira, bata os ovos com o açúcar até obter uma mistura clara e fofa.',
    'Em uma tigela, misture o óleo de coco com o chocolate e leve ao micro-ondas até derreter completamente, mexendo bem.',
    'Incorpore o chocolate derretido à mistura de ovos, adicione a baunilha e misture.',
    'Acrescente a abobrinha ralada e misture delicadamente.',
    'Peneire o cacau em pó e junte a farinha de amêndoas, o bicarbonato e o sal, misturando até ficar homogêneo.',
    'Se desejar, adicione o chocolate amargo picado.',
    'Despeje a massa na forma, nivele com uma espátula.',
    'Asse por 20 a 25 minutos, até as bordas firmarem e o centro ficar levemente úmido.',
    'Deixe esfriar completamente antes de cortar.'
  ],
  tempo_preparo: 38, // Preparo: 15 minutos + Forno: 20-25 minutos (média 22.5) = ~38 minutos
  porcoes: 9, // Média entre 8 a 10 pedaços
  dificuldade: 'medio',
  tipo_refeicao: 'snacks',
  tags: ['Sobremesa', 'Funcional', 'Sem glúten', 'Sem açúcar refinado', 'Mais saudável'],
  is_premium: true, // Receita PREMIUM por padrão
  is_free: false,
  // Informações nutricionais (por pedaço - 1/9 da receita)
  calorias: 175, // Média entre 160-190 kcal
  carboidratos: 12, // Média entre 10-14 g
  proteinas: 5, // Média entre 4-6 g
  gorduras: 12, // Média entre 10-13 g (arredondado)
  fibras: null,
  sodio: null,
  informacoes_nutricionais: `Por pedaço (1/9 da receita)
* Calorias: ~160–190 kcal
* Proteínas: ~4–6 g
* Gorduras: ~10–13 g
* Carboidratos: ~10–14 g

➡️ Valores podem variar conforme:
– ingredientes utilizados
– tipo de farinha escolhida
– tipo de adoçante utilizado
– uso de chocolate amargo picado`,
  aviso_nutricional: 'Valores nutricionais estimados via aplicativo e não substituem orientação nutricional profissional.',
  substituicoes_ingredientes: {
    'Farinha de amêndoas': ['farinha de aveia', 'farinha de coco', 'mix sem glúten'],
    'Açúcar mascavo': ['xilitol', 'eritritol', 'blend culinário'],
    'Óleo de coco': ['manteiga ghee', 'óleo de abacate']
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
  console.log(`${colors.blue}  🥒🍫 Cadastro de Brownie de Abobrinha com Chocolate${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  console.log(`${colors.cyan}📝 Receita a cadastrar:${colors.reset}`);
  console.log(`   Título: ${receita.titulo}`);
  console.log(`   Ingredientes: ${receita.ingredientes.length}`);
  console.log(`   Modo de Preparo: ${receita.modo_preparo.length} passos`);
  console.log(`   Substituições: ${Object.keys(receita.substituicoes_ingredientes || {}).length} ingredientes`);
  console.log(`   Tags: ${receita.tags.join(', ')}`);
  console.log(`   Calorias: ${receita.calorias} kcal (por pedaço)`);
  console.log(`   Carboidratos: ${receita.carboidratos} g (por pedaço)`);
  console.log(`   Proteínas: ${receita.proteinas} g (por pedaço)`);
  console.log(`   Gorduras: ${receita.gorduras} g (por pedaço)`);
  console.log(`   Tempo de preparo: ${receita.tempo_preparo} minutos`);
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
