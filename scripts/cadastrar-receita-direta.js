/**
 * Script para cadastrar receitas diretamente via texto
 * 
 * USO:
 * 1. Cole a receita no formato fornecido como argumento ou em arquivo
 * 2. Execute: node scripts/cadastrar-receita-direta.js "texto da receita aqui"
 *    OU: node scripts/cadastrar-receita-direta.js --file receita.txt
 * 
 * O script:
 * - Converte automaticamente o formato de texto para JSON
 * - Verifica se a receita já existe (não duplica)
 * - Cadastra via API
 * - Tenta como FREE primeiro, se falhar tenta como PREMIUM
 */

const axios = require('axios');
const fs = require('fs');
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

// Função para parsear receita (mesma do script anterior)
function parsearReceita(texto) {
  const receita = {
    titulo: '',
    descricao: '',
    ingredientes: [],
    modo_preparo: [],
    substituicoes_ingredientes: {},
    informacoes_nutricionais: '',
    tempo_preparo: 0,
    porcoes: 0,
    dificuldade: 'medio',
    tipo_refeicao: 'snacks',
    tags: [],
    is_premium: false,
    is_free: false,
    calorias: null,
    proteinas: null,
    carboidratos: null,
    gorduras: null,
    fibras: null,
  };

  const linhas = texto.split('\n').map(l => l.trim()).filter(l => l);

  let secaoAtual = '';
  let modoPreparoNumero = 0;
  let substituicoesAtivas = false;
  let ingredienteAtual = '';

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];

    // Título (linha com 🍌💪 ou outros emojis de comida, mas não linha de classificação)
    if (!linha.includes('📌 Classificação') && linha.match(/[🍌💪🍔🥗🍝🍕🍰🍪🥞🧇🍞🥐🥖🥨🥯🥪🌮🌯🥙🔥🌯]/)) {
      // Capturar título completo com emojis
      if (!receita.titulo) {
        // Se tem pipe, pegar apenas a parte antes do primeiro pipe
        if (linha.includes('|')) {
          receita.titulo = linha.split('|')[0].trim();
        } else {
          receita.titulo = linha.split(/\s*Práticas|\s*Rápida|\s*Deliciosa/)[0].trim();
        }
      }
    }

    // Descrição
    if ((linha.includes('Práticas') || linha.includes('Rápida') || linha.includes('Deliciosa')) && !receita.descricao && receita.titulo) {
      receita.descricao = linha.trim();
    }

    // Rendimento
    if (linha.includes('⭐ Rendimento') || linha.includes('Rendimento')) {
      const match = linha.match(/(\d+)\s*a\s*(\d+)/);
      if (match) {
        receita.porcoes = Math.floor((parseInt(match[1]) + parseInt(match[2])) / 2);
      } else {
        const matchUnico = linha.match(/(\d+)/);
        if (matchUnico) {
          receita.porcoes = parseInt(matchUnico[1]);
        }
      }
    }

    // Tempo
    if (linha.includes('⏱ Tempo Total') || linha.includes('Tempo Total')) {
      const matchPreparo = linha.match(/Preparo:\s*(\d+)\s*minutos?/i);
      if (matchPreparo) {
        receita.tempo_preparo = parseInt(matchPreparo[1]);
      }
      const matchForno = linha.match(/Forno:\s*(\d+)[–-](\d+)\s*minutos?/i);
      if (matchForno) {
        const tempoForno = Math.floor((parseInt(matchForno[1]) + parseInt(matchForno[2])) / 2);
        receita.tempo_preparo = (receita.tempo_preparo || 0) + tempoForno;
      }
    }

    // Ingredientes
    if (linha.includes('🛒 Ingredientes') || linha.includes('Ingredientes')) {
      secaoAtual = 'ingredientes';
      continue;
    }

    // Modo de Preparo
    if (linha.includes('👩‍🍳 Modo de Preparo') || linha.includes('Modo de Preparo')) {
      secaoAtual = 'modo_preparo';
      continue;
    }

    // Substituições
    if (linha.includes('🔁 Substituições') || linha.includes('Substituições')) {
      secaoAtual = 'substituicoes';
      substituicoesAtivas = true;
      continue;
    }

    // Informações Nutricionais
    if (linha.includes('🔢 Informação Nutricional') || linha.includes('Informação Nutricional')) {
      secaoAtual = 'nutricional';
      continue;
    }

    // Processar linhas conforme seção
    if (secaoAtual === 'ingredientes' && linha.startsWith('*')) {
      const ingrediente = linha.replace(/^\*\s*/, '').trim();
      if (ingrediente) {
        receita.ingredientes.push(ingrediente);
        ingredienteAtual = ingrediente.toLowerCase();
      }
    }

    if (secaoAtual === 'modo_preparo') {
      const matchNumero = linha.match(/^(\d+)\.\s*(.+)/);
      if (matchNumero) {
        receita.modo_preparo.push(matchNumero[2].trim());
        modoPreparoNumero = parseInt(matchNumero[1]);
      } else if (linha.startsWith('*')) {
        receita.modo_preparo.push(linha.replace(/^\*\s*/, '').trim());
      }
    }

    if (secaoAtual === 'substituicoes' && substituicoesAtivas) {
      if (linha.match(/^[🍌🌾🌰💪🧈]/)) {
        if (linha.includes('🍌') || linha.includes('Banana')) {
          ingredienteAtual = 'banana';
        } else if (linha.includes('🌾') || linha.includes('Aveia')) {
          ingredienteAtual = 'aveia';
        } else if (linha.includes('🌰') || linha.includes('Amêndoas')) {
          ingredienteAtual = 'amêndoas';
        } else if (linha.includes('💪') || linha.includes('Proteína')) {
          ingredienteAtual = 'proteína';
        } else if (linha.includes('🧈') || linha.includes('Óleo de coco')) {
          ingredienteAtual = 'óleo de coco';
        }
      } else if (linha.startsWith('*') && ingredienteAtual) {
        const substituto = linha.replace(/^\*\s*/, '').trim();
        if (substituto && !receita.substituicoes_ingredientes[ingredienteAtual]) {
          receita.substituicoes_ingredientes[ingredienteAtual] = [];
        }
        if (substituto) {
          receita.substituicoes_ingredientes[ingredienteAtual].push(substituto);
        }
      }
    }

    if (secaoAtual === 'nutricional') {
      // Acumular texto completo das informações nutricionais
      if (!receita.informacoes_nutricionais) {
        receita.informacoes_nutricionais = '';
      }
      
      // Adicionar linha ao texto (remover emojis e símbolos desnecessários)
      let linhaLimpa = linha.trim();
      linhaLimpa = linhaLimpa.replace(/^[🔢👉➡️]\s*/, '');
      
      // Se a linha contém informação útil, adicionar
      if (linhaLimpa && !linhaLimpa.match(/^Informação Nutricional/i)) {
        if (receita.informacoes_nutricionais) {
          receita.informacoes_nutricionais += '\n';
        }
        receita.informacoes_nutricionais += linhaLimpa;
      }
      
      // Extrair valores nutricionais numéricos para campos separados
      if (linha.includes('Calorias:')) {
        const match = linha.match(/Calorias:\s*~?(\d+)[–-]?(\d+)?/);
        if (match) {
          receita.calorias = match[2] ? Math.floor((parseInt(match[1]) + parseInt(match[2])) / 2) : parseInt(match[1]);
        }
      }
      if (linha.includes('Carboidratos:')) {
        const match = linha.match(/Carboidratos:\s*~?(\d+)[–-]?(\d+)?/);
        if (match) {
          receita.carboidratos = match[2] ? Math.floor((parseInt(match[1]) + parseInt(match[2])) / 2) : parseInt(match[1]);
        }
      }
      if (linha.includes('Proteínas:')) {
        const match = linha.match(/Proteínas:\s*~?(\d+)[–-]?(\d+)?/);
        if (match) {
          receita.proteinas = match[2] ? Math.floor((parseInt(match[1]) + parseInt(match[2])) / 2) : parseInt(match[1]);
        }
      }
      if (linha.includes('Gorduras:')) {
        const match = linha.match(/Gorduras:\s*~?(\d+)[–-]?(\d+)?/);
        if (match) {
          receita.gorduras = match[2] ? Math.floor((parseInt(match[1]) + parseInt(match[2])) / 2) : parseInt(match[1]);
        }
      }
      if (linha.includes('Fibras:')) {
        const match = linha.match(/Fibras:\s*~?(\d+)[–-]?(\d+)?/);
        if (match) {
          receita.fibras = match[2] ? Math.floor((parseInt(match[1]) + parseInt(match[2])) / 2) : parseInt(match[1]);
        }
      }
    }

    // Tags da classificação
    if (linha.includes('📌 Classificação') || linha.includes('Classificação')) {
      const partes = linha.split('|').map(t => t.trim());
      partes.forEach(parte => {
        if (parte.toLowerCase().includes('snack')) receita.tags.push('snack');
        if (parte.toLowerCase().includes('lanche')) receita.tags.push('lanche');
        if (parte.toLowerCase().includes('proteico')) receita.tags.push('proteico');
        if (parte.toLowerCase().includes('pré') || parte.toLowerCase().includes('pós-treino')) receita.tags.push('treino');
      });
    }
  }

  // Ajustes finais
  if (!receita.titulo) {
    // Tentar extrair título da primeira linha
    const primeiraLinha = linhas[0];
    if (primeiraLinha) {
      receita.titulo = primeiraLinha.replace(/[📌🍌💪🍔🥗🍝🍕🍰🍪🥞🧇🍞🥐🥖🥨🥯🥪🌮🌯🥙]/g, '').trim().split(/\s*\|/)[0];
    }
    if (!receita.titulo) {
      receita.titulo = 'Nova Receita';
    }
  }
  
  if (!receita.descricao) {
    // Tentar encontrar descrição
    for (const linha of linhas) {
      if (linha.length > 50 && !linha.includes('*') && !linha.match(/^\d+\./)) {
        receita.descricao = linha;
        break;
      }
    }
  }
  
  if (receita.porcoes === 0) {
    receita.porcoes = 4; // Default
  }
  if (receita.tempo_preparo === 0) {
    receita.tempo_preparo = 30; // Default
  }

  // Adicionar tags padrão se necessário
  if (receita.tags.length === 0) {
    receita.tags.push('receita');
  }

  // Limpar e formatar informações nutricionais
  if (receita.informacoes_nutricionais) {
    // Remover linhas vazias duplicadas e limpar
    receita.informacoes_nutricionais = receita.informacoes_nutricionais
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.match(/^➡️|^Valores podem variar/i))
      .join('\n')
      .trim();
  }

  return receita;
}

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
    const tituloLimpo = titulo.replace(/[🍫🍽️🥗🥘🍲🍳🥞🧇🍞🥐🥖🥨🥯🥪🌮🌯🥙🥗🥘🍝🍜🍲🍱🍣🍤🍥🥮🍢🍡🍧🍨🍦🥧🍰🎂🍮🍭🍬🍫🍿🍩🍪🌰🥜🍯🥛🍼☕🍵🥤🍶🍺🍻🥂🍷🥃🍸🍹🍾🥡🥢🍴🍽️💪🍌🌯🔥🥔🍫🍓🍋🥭🍹🥞🍨🍫🍒🍫🥕🌮🌾🍈🥚🧀]/g, '').trim();
    const searchTerm = encodeURIComponent(tituloLimpo);
    
    console.log(`${colors.cyan}🔍 Verificando duplicatas: "${tituloLimpo}"${colors.reset}`);
    
    const response = await axios.get(
      `${API_URL}/receitas?search=${searchTerm}&incluirInativas=true`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log(`${colors.yellow}   Encontradas ${response.data.length} receitas similares${colors.reset}`);
      const receitaExistente = response.data.find(
        r => r.titulo && r.titulo.toLowerCase().trim() === titulo.toLowerCase().trim()
      );
      
      if (receitaExistente) {
        console.log(`${colors.yellow}   ⚠️  Receita duplicada encontrada: "${receitaExistente.titulo}"${colors.reset}`);
        return { existe: true, receita: receitaExistente };
      } else {
        console.log(`${colors.green}   ✅ Nenhuma receita duplicada encontrada${colors.reset}`);
      }
    }

    return { existe: false };
  } catch (error) {
    console.log(`${colors.yellow}   ⚠️  Erro ao verificar duplicatas, continuando...${colors.reset}`);
    return { existe: false };
  }
}

async function criarReceita(token, receita) {
  try {
    // Verificar se já existe (comparação exata do título completo)
    const verificacao = await verificarReceitaExistente(token, receita.titulo);
    if (verificacao.existe) {
      console.log(`${colors.yellow}⚠️  Receita já existe!${colors.reset}`);
      console.log(`   Título existente: ${verificacao.receita.titulo}`);
      console.log(`   ID: ${verificacao.receita.id}`);
      return {
        success: false,
        error: `Receita já existe com ID: ${verificacao.receita.id}`,
        receita: receita.titulo,
        duplicata: true,
      };
    }

    // Preparar dados - tentar como FREE primeiro
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
      is_premium: false,
      is_free: true, // Tentar como FREE primeiro
      informacoes_nutricionais: receita.informacoes_nutricionais || '',
      substituicoes_ingredientes: Object.keys(receita.substituicoes_ingredientes || {}).length > 0 
        ? receita.substituicoes_ingredientes 
        : undefined,
    };

    // Remover campos undefined/null
    Object.keys(dadosReceita).forEach(key => {
      if (dadosReceita[key] === undefined || dadosReceita[key] === null || 
          (Array.isArray(dadosReceita[key]) && dadosReceita[key].length === 0) ||
          (typeof dadosReceita[key] === 'object' && Object.keys(dadosReceita[key]).length === 0)) {
        delete dadosReceita[key];
      }
    });

    console.log(`${colors.cyan}📝 Cadastrando receita: ${receita.titulo}${colors.reset}`);
    let response;
    
    try {
      response = await axios.post(
        `${API_URL}/receitas`,
        dadosReceita,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      // Se o erro for limite de receitas FREE, tentar como premium
      if (error.response?.status === 400 && 
          error.response?.data?.message?.includes('Máximo de 50 receitas FREE')) {
        console.log(`${colors.yellow}  ⚠️  Limite de receitas FREE atingido. Tentando como PREMIUM...${colors.reset}`);
        
        dadosReceita.is_free = false;
        dadosReceita.is_premium = true;
        
        response = await axios.post(
          `${API_URL}/receitas`,
          dadosReceita,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      } else {
        throw error;
      }
    }

    // Atualizar dados nutricionais numéricos
    if (receita.calorias || receita.proteinas || receita.carboidratos || receita.gorduras || receita.fibras) {
      const dadosNutricionais = {};
      if (receita.calorias !== null && receita.calorias !== undefined) dadosNutricionais.calorias = receita.calorias;
      if (receita.proteinas !== null && receita.proteinas !== undefined) dadosNutricionais.proteinas = receita.proteinas;
      if (receita.carboidratos !== null && receita.carboidratos !== undefined) dadosNutricionais.carboidratos = receita.carboidratos;
      if (receita.gorduras !== null && receita.gorduras !== undefined) dadosNutricionais.gorduras = receita.gorduras;
      if (receita.fibras !== null && receita.fibras !== undefined) dadosNutricionais.fibras = receita.fibras;

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

    return { 
      success: true, 
      data: response.data,
      cadastradaComoPremium: dadosReceita.is_premium
    };
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
  console.log(`${colors.blue}  🍽️  Cadastro de Receita Nova${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  // Obter texto da receita
  let receitaTexto = '';
  const args = process.argv.slice(2);

  if (args[0] === '--file' || args[0] === '-f') {
    // Ler de arquivo
    const filePath = args[1] || path.join(__dirname, 'receita-temp.txt');
    if (!fs.existsSync(filePath)) {
      console.error(`${colors.red}❌ Arquivo não encontrado: ${filePath}${colors.reset}`);
      return;
    }
    receitaTexto = fs.readFileSync(filePath, 'utf8');
  } else if (args.length > 0) {
    // Receita como argumento
    receitaTexto = args.join(' ');
  } else {
    console.error(`${colors.red}❌ Uso: node cadastrar-receita-direta.js "texto da receita"${colors.reset}`);
    console.error(`${colors.yellow}   OU: node cadastrar-receita-direta.js --file receita.txt${colors.reset}`);
    return;
  }

  // Parsear receita
  console.log(`${colors.cyan}📝 Parseando receita...${colors.reset}`);
  const receita = parsearReceita(receitaTexto);
  console.log(`${colors.green}✅ Receita parseada:${colors.reset}`);
  console.log(`   Título: ${receita.titulo}`);
  console.log(`   Ingredientes: ${receita.ingredientes.length}`);
  console.log(`   Modo de Preparo: ${receita.modo_preparo.length} passos`);
  console.log(`   Substituições: ${Object.keys(receita.substituicoes_ingredientes).length} ingredientes\n`);

  // Login
  let token;
  try {
    token = await login();
  } catch (error) {
    console.error(`${colors.red}❌ Não foi possível fazer login.${colors.reset}`);
    return;
  }

  // Cadastrar
  const resultado = await criarReceita(token, receita);

  if (resultado.success) {
    console.log(`${colors.green}✅ Receita cadastrada com sucesso!${colors.reset}`);
    console.log(`   ID: ${resultado.data.id}`);
    console.log(`   Título: ${resultado.data.titulo}`);
    if (resultado.cadastradaComoPremium) {
      console.log(`   ${colors.yellow}⚠️  Cadastrada como PREMIUM (limite de FREE atingido)${colors.reset}`);
    }
    console.log('');
  } else if (resultado.duplicata) {
    console.log(`${colors.yellow}⚠️  Receita já existe!${colors.reset}`);
    console.log(`   ${resultado.error}\n`);
  } else {
    console.log(`${colors.red}❌ Erro ao cadastrar:${colors.reset}`);
    console.log(`   ${JSON.stringify(resultado.error)}\n`);
  }
}

main().catch(error => {
  console.error(`${colors.red}❌ Erro fatal:${colors.reset}`, error);
  process.exit(1);
});
