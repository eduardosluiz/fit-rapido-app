/**
 * Script para cadastrar uma receita nova diretamente via texto
 * 
 * USO:
 * 1. Cole a receita no formato fornecido
 * 2. Execute: node scripts/cadastrar-receita-nova.js
 * 
 * O script:
 * - Converte automaticamente o formato de texto para JSON
 * - Verifica se a receita já existe (não duplica)
 * - Cadastra via API
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

// Receita fornecida pelo usuário
const receitaTexto = `📌 Classificação para ebook Café da manhã proteico | Refeição leve | Pós-treino
🧇🍗 Protein Waffle Salgado Simples, rápida e com alto teor de proteína — ideal para café da manhã reforçado, almoço leve ou refeição pós-treino.
⭐ Rendimento 1 waffle grande
⏱ Tempo Total Preparo: 5 minutos Frigideira: ~4 minutos
🛒 Ingredientes
* 1 ovo
* 1 colher (sopa) de tapioca (10 g)
* 1 colher (sopa) de parmesão ralado (10 g)
* 3 colheres (sopa) de frango desfiado (60 g)
* 1 colher (sopa) de cottage (20 g)
* Sal e pimenta-do-reino a gosto
👩‍🍳 Modo de Preparo
1. Em um bowl, bata o ovo com a tapioca, o parmesão, o cottage, o frango desfiado, o sal e a pimenta até obter uma mistura homogênea.
2. Aqueça uma frigideira antiaderente (ou waffleira).
3. Despeje a massa e cozinhe por cerca de 2 minutos de cada lado, até dourar.
4. Sirva imediatamente.
✨ Resultado Waffle dourado por fora, macio por dentro e extremamente saboroso, com textura leve e alto valor proteico.
🔢 Informação Nutricional Aproximada 👉 Por unidade
* Calorias: ~280–310 kcal
* Carboidratos: ~10–12 g
* Proteínas: ~30–34 g
* Gorduras: ~12–14 g
➡️ Valores podem variar conforme: – tamanho do ovo – tipo de queijo – preparo do frango
🔁 Substituições Inteligentes 🍗 Frango desfiado
* Atum
* Carne moída magra
* Cogumelos salteados
🧀 Cottage
* Ricota amassada
* Cream cheese light
🌾 Tapioca
* Farinha de aveia
* Polvilho doce
💡 Dica Sirva com salada, legumes grelhados ou guacamole para uma refeição completa. Também funciona muito bem como meal prep, mantendo boa textura quando reaquecido.
⚠️ Aviso simples Valores nutricionais estimados via aplicativo e não substituem orientação nutricional profissional.`;

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
    tipo_refeicao: 'snacks', // Default
    tags: [],
    is_premium: false,
    is_free: false, // Será definido automaticamente se necessário
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

    // Título (linha com emojis de comida, mas não a linha de classificação)
    if (linha.match(/[🌰✨🍌💪🍔🥗🍝🍕🍰🍪🥞🧇🍞🥐🥖🥨🥯🥪🌮🌯🥙🍓❄️🧀🍯🔥🍈💧🌿🌶️🍂🍗]/) && !linha.includes('📌 Classificação')) {
      if (!receita.titulo) {
        // Extrair título mantendo emojis - pegar até a primeira palavra descritiva
        const matchTitulo = linha.match(/^([🌰✨🍌💪🍔🥗🍝🍕🍰🍪🥞🧇🍞🥐🥖🥨🥯🥪🌮🌯🥙🍓❄️🧀🍯🔥🍈💧🌿🌶️🍂🍗🫓🍫🍇🍦\s]+[^Uma|Práticas|Rápida|Deliciosa|Cremoso|Simples|Leve|hidratante|Suculento|aromático|versáteis|equilibrada|adocicado]+?)(?:\s*(?:Uma|Práticas|Rápida|Deliciosa|Cremoso|Simples|nutritivo|versátil|Leve|hidratante|Suculento|aromático|versáteis|equilibrada|adocicado))/);
        if (matchTitulo) {
          receita.titulo = matchTitulo[1].trim();
        } else {
          // Se não encontrar padrão, pegar até 50 caracteres ou até encontrar descrição
          const partes = linha.split(/\s*(?:Uma|Práticas|Rápida|Deliciosa|Cremoso|Simples|Leve|hidratante|Suculento|aromático|versáteis|equilibrada|adocicado)/);
          receita.titulo = partes[0].trim();
        }
      }
    }

    // Descrição (linha após título que contém palavras descritivas, mas SEM emojis)
    if ((linha.includes('Uma combinação') || linha.includes('Práticas') || linha.includes('Rápida') || linha.includes('Deliciosa') || linha.includes('Cremoso') || linha.includes('Simples') || linha.includes('irresistivelmente') || linha.includes('Leve') || linha.includes('hidratante') || linha.includes('Suculento') || linha.includes('aromático') || linha.includes('versáteis') || linha.includes('equilibrada') || linha.includes('adocicado')) && !receita.descricao && receita.titulo) {
      // Remover emojis da descrição - pegar apenas o texto após o título
      let descricaoLimpa = linha.trim();
      // Remover o título se estiver presente na linha
      if (receita.titulo && descricaoLimpa.includes(receita.titulo.replace(/[🌰✨🍌💪🍔🥗🍝🍕🍰🍪🥞🧇🍞🥐🥖🥨🥯🥪🌮🌯🥙🍓❄️🧀🍯🔥🍈💧🌿🌶️🍂]/g, '').trim())) {
        descricaoLimpa = descricaoLimpa.replace(receita.titulo, '').trim();
      }
      // Remover emojis comuns
      descricaoLimpa = descricaoLimpa.replace(/[🌰✨🍌💪🍔🥗🍝🍕🍰🍪🥞🧇🍞🥐🥖🥨🥯🥪🌮🌯🥙🍓❄️🧀🍯🔥🍈💧🌿🌶️🍂🍗🫓🍫🍇🍦]/g, '').trim();
      receita.descricao = descricaoLimpa;
    }

    // Rendimento
    if (linha.includes('⭐ Rendimento') || linha.includes('Rendimento')) {
      const match = linha.match(/(\d+)\s*a\s*(\d+)/);
      if (match) {
        receita.porcoes = Math.floor((parseInt(match[1]) + parseInt(match[2])) / 2);
        } else {
          const matchSingle = linha.match(/(\d+)\s+porção/);
          if (matchSingle) {
            receita.porcoes = parseInt(matchSingle[1]);
          } else {
            // Tentar "Aproximadamente X porções"
            const matchAprox = linha.match(/Aproximadamente\s+(\d+)\s+porção/);
            if (matchAprox) {
              receita.porcoes = parseInt(matchAprox[1]);
            }
          }
        }
    }

    // Tempo
    if (linha.includes('⏱ Tempo Total')) {
      const matchPreparo = linha.match(/Preparo:\s*(\d+)\s*minutos/);
      if (matchPreparo) {
        receita.tempo_preparo = parseInt(matchPreparo[1]);
      }
      // Se tiver tempo de forno, freezer ou cozimento, somar ao preparo
      const matchForno = linha.match(/Forno:\s*(\d+)[–-](\d+)\s*minutos/);
      const matchFreezer = linha.match(/Freezer[^:]*:\s*(\d+)[–-](\d+)\s*horas/);
      const matchFornoMinutos = linha.match(/Forno:\s*~?(\d+)\s*minutos/);
      if (matchForno) {
        const tempoForno = Math.floor((parseInt(matchForno[1]) + parseInt(matchForno[2])) / 2);
        receita.tempo_preparo = (receita.tempo_preparo || 0) + tempoForno;
      } else if (matchFornoMinutos) {
        const tempoForno = parseInt(matchFornoMinutos[1]);
        receita.tempo_preparo = (receita.tempo_preparo || 0) + tempoForno;
      } else if (matchFreezer) {
        // Freezer é opcional, não somar ao tempo de preparo
        // Mas podemos considerar como tempo total se necessário
      }
    }

    // Ingredientes
    if (linha.includes('🛒 Ingredientes')) {
      secaoAtual = 'ingredientes';
      continue;
    }

    // Modo de Preparo
    if (linha.includes('👩‍🍳 Modo de Preparo')) {
      secaoAtual = 'modo_preparo';
      continue;
    }

    // Substituições
    if (linha.includes('🔁 Substituições Inteligentes')) {
      secaoAtual = 'substituicoes';
      substituicoesAtivas = true;
      continue;
    }

    // Informações Nutricionais
    if (linha.includes('🔢 Informação Nutricional')) {
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
      // Verificar se é um passo numerado
      const matchNumero = linha.match(/^(\d+)\.\s*(.+)/);
      if (matchNumero) {
        receita.modo_preparo.push(matchNumero[2].trim());
        modoPreparoNumero = parseInt(matchNumero[1]);
      } else if (linha.startsWith('*')) {
        // Linha com asterisco também pode ser passo
        receita.modo_preparo.push(linha.replace(/^\*\s*/, '').trim());
      }
    }

    if (secaoAtual === 'substituicoes' && substituicoesAtivas) {
      // Processar substituições por ingrediente
      if (linha.match(/^[🍌🌾🌰💪🧈🌻]/)) {
        // Nova categoria de substituição
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
        } else         if (linha.includes('🌻') || linha.includes('Semente de girassol') || linha.includes('girassol')) {
          ingredienteAtual = 'semente de girassol';
        } else if (linha.includes('Linhaça')) {
          ingredienteAtual = 'linhaça';
        } else if (linha.includes('🍓') || linha.includes('Morango')) {
          ingredienteAtual = 'morango';
        } else if (linha.includes('🧀') || linha.includes('Ricota')) {
          ingredienteAtual = 'ricota cremosa';
        } else if (linha.includes('🍯') || linha.includes('Mel') || linha.includes('tâmaras')) {
          ingredienteAtual = 'mel / tâmaras';
        } else if (linha.includes('🧀') || linha.includes('Parmesão')) {
          ingredienteAtual = 'parmesão';
        } else if (linha.includes('🌰') || linha.includes('Finalização')) {
          ingredienteAtual = 'finalização';
        } else if (linha.includes('🌿') || linha.includes('Hortelã')) {
          ingredienteAtual = 'hortelã';
        } else if (linha.includes('🌶️') || linha.includes('Gengibre')) {
          ingredienteAtual = 'gengibre';
        } else if (linha.includes('🍂') || linha.includes('Canela')) {
          ingredienteAtual = 'canela';
        } else if (linha.includes('🍋') || linha.includes('Limão')) {
          ingredienteAtual = 'limão';
        } else if (linha.includes('🥛') || linha.includes('Iogurte')) {
          ingredienteAtual = 'iogurte natural';
        } else if (linha.includes('🌶️') && linha.includes('Temperos')) {
          ingredienteAtual = 'temperos';
        } else if (linha.includes('🥣') || linha.includes('Cottage')) {
          ingredienteAtual = 'cottage';
        } else if (linha.includes('🌾') || linha.includes('Mix sem glúten')) {
          ingredienteAtual = 'mix sem glúten';
        } else if (linha.includes('🧀') && linha.includes('Recheios')) {
          ingredienteAtual = 'recheios';
        } else if (linha.includes('🥣') && linha.includes('Iogurte natural')) {
          ingredienteAtual = 'iogurte natural';
        } else if (linha.includes('🍓') && linha.includes('Morango')) {
          ingredienteAtual = 'morango';
        } else if (linha.includes('🍫') && linha.includes('Chocolate sem açúcar')) {
          ingredienteAtual = 'chocolate sem açúcar';
        } else if (linha.includes('🌰') && linha.includes('Amêndoas')) {
          ingredienteAtual = 'amêndoas';
        } else if (linha.includes('🍯') && linha.includes('Adoçante')) {
          ingredienteAtual = 'adoçante';
        } else if (linha.includes('🍓') && linha.includes('Finalização')) {
          ingredienteAtual = 'finalização';
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
      // Remover emojis do início da linha, mas manter o conteúdo
      linhaLimpa = linhaLimpa.replace(/^[🔢👉➡️]\s*/, '');
      
      // Se a linha contém informação útil, adicionar
      if (linhaLimpa && !linhaLimpa.match(/^Informação Nutricional/i)) {
        // Se já existe conteúdo, adicionar quebra de linha antes
        if (receita.informacoes_nutricionais && !receita.informacoes_nutricionais.endsWith('\n')) {
          receita.informacoes_nutricionais += '\n';
        }
        receita.informacoes_nutricionais += linhaLimpa;
        // Sempre adicionar quebra de linha após cada informação
        receita.informacoes_nutricionais += '\n';
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
    if (linha.includes('📌 Classificação')) {
      const partes = linha.split('|').map(t => t.trim());
      partes.forEach(parte => {
        if (parte.toLowerCase().includes('snack')) receita.tags.push('snack');
        if (parte.toLowerCase().includes('lanche')) receita.tags.push('lanche');
        if (parte.toLowerCase().includes('proteico')) receita.tags.push('proteico');
        if (parte.toLowerCase().includes('pré') || parte.toLowerCase().includes('pós-treino')) receita.tags.push('treino');
        if (parte.toLowerCase().includes('mix')) receita.tags.push('mix');
        if (parte.toLowerCase().includes('funcional')) receita.tags.push('funcional');
        if (parte.toLowerCase().includes('facilidades')) receita.tags.push('prático');
      });
    }
  }

  // Ajustes finais
  if (!receita.titulo) {
    receita.titulo = 'Barrinhas de Banana com Proteína';
  }
  if (!receita.descricao) {
    receita.descricao = 'Práticas, nutritivas e cheias de fibras e gorduras boas — ideais para levar na bolsa, consumir antes do treino ou como lanche equilibrado ao longo do dia.';
  }
  if (receita.porcoes === 0) {
    // Tentar extrair do texto "1 porção grande (ou 2 porções médias)"
    const matchPorcoes = texto.match(/Rendimento\s+(\d+)\s+porção/);
    if (matchPorcoes) {
      receita.porcoes = parseInt(matchPorcoes[1]);
    } else {
      receita.porcoes = 1; // Default
    }
  }
  if (receita.tempo_preparo === 0) {
    receita.tempo_preparo = 5; // Preparo padrão
  }

  // Adicionar tags padrão baseado no tipo
  if (receita.titulo.toLowerCase().includes('semente') || receita.titulo.toLowerCase().includes('mix')) {
    if (!receita.tags.includes('sementes')) receita.tags.push('sementes');
    if (!receita.tags.includes('mix')) receita.tags.push('mix');
  }
  if (receita.titulo.toLowerCase().includes('cheesecake') || receita.titulo.toLowerCase().includes('gelado')) {
    if (!receita.tags.includes('sobremesa')) receita.tags.push('sobremesa');
    if (!receita.tags.includes('gelado')) receita.tags.push('gelado');
  }

  // Limpar e formatar informações nutricionais
  if (receita.informacoes_nutricionais) {
    // Processar linhas e garantir quebras de linha adequadas
    let texto = receita.informacoes_nutricionais;
    
    // Dividir por padrões de informação nutricional para garantir quebras
    // Padrão 1: "Nome: valor" seguido de outro "Nome: valor" sem quebra
    texto = texto.replace(/([A-Za-záàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]+:\s*~[^\n*]+)(?=\s*[A-Za-záàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]+:\s*~)/g, '$1\n');
    // Padrão 2: "* item" seguido de outro "* item" sem quebra
    texto = texto.replace(/(\*\s*[^\n*]+)(?=\s*\*)/g, '$1\n');
    
    // Separar informações nutricionais do aviso
    // O aviso deve ser mantido mas separado com quebra de linha
    texto = texto.replace(/([^\n])(➡️\s*Valores podem variar)/i, '$1\n$2');
    
    // Processar linhas - manter o aviso mas separado
    const linhas = texto
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l); // Não remover o aviso, apenas linhas vazias
    
    receita.informacoes_nutricionais = linhas.join('\n').trim();
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
    const tituloLimpo = titulo.replace(/[🍫🍽️🥗🥘🍲🍳🥞🧇🍞🥐🥖🥨🥯🥪🌮🌯🥙🥗🥘🍝🍜🍲🍱🍣🍤🍥🥮🍢🍡🍧🍨🍦🥧🍰🎂🍮🍭🍬🍫🍿🍩🍪🌰🥜🍯🥛🍼☕🍵🥤🍶🍺🍻🥂🍷🥃🍸🍹🍾🥡🥢🍴🍽️💪🍌]/g, '').trim();
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
      is_premium: receita.is_premium || false,
      is_free: receita.is_free !== undefined ? receita.is_free : false, // Tentar como premium primeiro
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

    return { success: true, data: response.data };
  } catch (error) {
    // Se o erro for limite de receitas FREE, tentar como premium
    if (error.response?.status === 400 && 
        error.response?.data?.message?.includes('Máximo de 50 receitas FREE')) {
      console.log(`${colors.yellow}  ⚠️  Limite de receitas FREE atingido. Tentando como PREMIUM...${colors.reset}`);
      
      dadosReceita.is_free = false;
      dadosReceita.is_premium = true;
      
      try {
        const responsePremium = await axios.post(
          `${API_URL}/receitas`,
          dadosReceita,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        // Atualizar dados nutricionais
        if (receita.calorias || receita.proteinas || receita.carboidratos || receita.gorduras || receita.fibras) {
          const dadosNutricionais = {};
          if (receita.calorias !== null && receita.calorias !== undefined) dadosNutricionais.calorias = receita.calorias;
          if (receita.proteinas !== null && receita.proteinas !== undefined) dadosNutricionais.proteinas = receita.proteinas;
          if (receita.carboidratos !== null && receita.carboidratos !== undefined) dadosNutricionais.carboidratos = receita.carboidratos;
          if (receita.gorduras !== null && receita.gorduras !== undefined) dadosNutricionais.gorduras = receita.gorduras;
          if (receita.fibras !== null && receita.fibras !== undefined) dadosNutricionais.fibras = receita.fibras;

          try {
            await axios.patch(
              `${API_URL}/receitas/${responsePremium.data.id}`,
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
        
        return { success: true, data: responsePremium.data, cadastradaComoPremium: true };
      } catch (premiumError) {
        return {
          success: false,
          error: premiumError.response?.data || premiumError.message,
          receita: receita.titulo,
        };
      }
    }
    
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
