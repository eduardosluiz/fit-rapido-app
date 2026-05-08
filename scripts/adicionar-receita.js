/**
 * Script para adicionar receitas no formato fornecido pelo usuário
 * 
 * USO:
 * 1. Cole a receita no formato fornecido na variável receitaTexto (linha ~12)
 * 2. Execute: node scripts/adicionar-receita.js
 * 
 * O script:
 * - Parse o formato fornecido
 * - Determina se é premium ou free baseado na classificação
 * - Não duplica receitas já cadastradas
 * - Adiciona ao receitas.json
 * - Cadastra APENAS essa receita nova no banco de dados
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../api/.env') });

// Receita fornecida pelo usuário (cole aqui)
const receitaTexto = `Lanche | Funcional | Proteico | Sem açúcar refinado | Sem glúten
🍫 Barra de Chocolate Fake de Leite em Pó, Whey e PistacheCremosa, gelada e prática — ideal para matar a vontade de doce de forma funcional e proteica, direto do freezer.
⭐ Rendimento1 grande
⏱ Tempo TotalPreparo: 10 minutosFreezer: 3 horas ou até firmar bem 
🛒 Ingredientes
* ½ xícara de leite em pó
* 1 scoop de whey protein (sabor baunilha ou neutro)
* 2 a 3 colheres (sopa) de óleo de coco ou TCM
* Adoçante a gosto (xilitol, eritritol ou outro)
* Água aos poucos (até dar ponto de creme espesso)
* Algumas gotas de essência de baunilha
* Pistache picado a gosto para finalizar
🔄 Substituições
* Leite em pó → sem lactose ou vegetal
* Whey → proteína vegetal ou colágeno
* Óleo de coco → TCM (sabor mais neutro)
* Pistache → amêndoas, castanhas ou nozes
👩‍🍳 Modo de Preparo
1. Em uma tigela, misture o leite em pó, o whey e o adoçante.
2. Acrescente o óleo de coco ou TCM e a essência de baunilha.
3. Vá adicionando água aos poucos, mexendo, até formar um creme homogêneo e espesso.
4. Forre uma grade com plástico filme ou utilize um tapete de silicone.
5. Espalhe a mistura de forma uniforme.
6. Finalize com pistache picado, pressionando levemente.
7. Leve ao freezer por 1 a 2 horas ou até ficar bem firme.
8. Corte nos formatos da grade e mantenha armazenado no freezer.
✨ ResultadoBarrinha gelada, cremosa e firme, com sabor de chocolate fake tipo chocolate branco e leve crocância do pistache.
🔢 Informação Nutricional Aproximada
👉 Por unidade (1/10 da grande )
* Calorias: ~90–100 kcal
* Proteínas: ~5,5–6,5 g
* Gorduras: ~6–7 g
* Carboidratos: ~2,5–3,5 g
➡️ Valores podem variar conforme marcas e adoçantes utilizados.
💡 Dica finalPara textura mais firme, use menos água. Para um toque gourmet, finalize com uma pitada de flor de sal.
⚠️ Aviso simplesValores nutricionais estimados via aplicativo e não substituem orientação nutricional profissional.
`;

/**
 * Normaliza o texto: substitui espaços especiais (non-breaking, etc.) por espaço normal.
 * Isso corrige problemas ao colar texto de PDFs, Word ou web.
 */
function normalizarTexto(texto) {
  return texto
    .replace(/\u00A0/g, ' ')   // Non-breaking space (NBSP)
    .replace(/[\u2000-\u200B\u202F\u205F\u3000]/g, ' ')  // Outros espaços Unicode
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
}

function parseReceita(texto) {
  const textoNormalizado = normalizarTexto(texto);
  const linhas = textoNormalizado.split('\n').map(l => l.trim()).filter(l => l);
  
  let receita = {
    titulo: '',
    descricao: '',
    ingredientes: [],
    modo_preparo: [],
    substituicoes_ingredientes: {},
    tempo_preparo: 0,
    porcoes: 0,
    dificuldade: 'medio',
    tipo_refeicao: 'snacks',
    tags: [],
    is_premium: false,
    is_free: true,
    informacoes_nutricionais: '',
    aviso_nutricional: '',
    calorias: null,
    proteinas: null,
    carboidratos: null,
    gorduras: null,
  };

  let secaoAtual = '';
  let modoPreparoIndex = 0;

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    
    // Classificação (pode vir sem emoji ou com emoji)
    if (linha.includes('📌 Classificação') || (!linha.match(/^[🍮⭐⏱🛒🔄👩‍🍳✨🔢💡⚠️➡️]/) && linha.includes('|') && !receita.tags.length)) {
      let classificacao = linha;
      if (linha.includes('📌 Classificação')) {
        classificacao = linha.replace('📌 Classificação para ebook', '').trim();
      }
      // Se a linha tem pipes (|), é classificação
      if (classificacao.includes('|')) {
        const tags = classificacao.split('|').map(t => t.trim()).filter(t => t);
        if (tags.length > 0) {
          receita.tags = tags;
          
          // Determinar se é premium baseado na classificação
          // Receitas com "Mais saudável" ou outras tags específicas são PREMIUM
          const tagsPremium = ['Mais saudável', 'Premium', 'Exclusivo', 'Funcional'];
          receita.is_premium = tags.some(tag => tagsPremium.some(tp => tag.toLowerCase().includes(tp.toLowerCase())));
          // Se for premium, não é free
          receita.is_free = !receita.is_premium;
        }
      }
    }
    
    // Título COM emoji (PRIORIDADE - manter emojis no título como na versão anterior)
    // Ex: "🍓🥛 Danoninho Fit Caseiro" ou "🍫🍈 Bombom de Maracujá"
    else if (!receita.titulo && 
             linha.match(/^[\u{1F300}-\u{1F9FF}\u2600-\u26FF]/u) && 
             !linha.startsWith('⭐') && 
             !linha.startsWith('★') &&
             !linha.startsWith('⏱') && 
             !linha.startsWith('🛒') && 
             !linha.startsWith('🔄') && 
             !linha.startsWith('👩‍🍳') && 
             !linha.startsWith('✨') && 
             !linha.startsWith('🔢') && 
             !linha.startsWith('💡') && 
             !linha.startsWith('⚠️') && 
             !linha.startsWith('➡️') &&
             !linha.startsWith('📌')) {
      secaoAtual = 'titulo';
      // MANTER os emojis no título - não remover!
      // Apenas extrair o texto após os emojis para processamento
      const tituloCompleto = linha.replace(/^[\u{1F300}-\u{1F9FF}\s]+/u, '').trim();
      
      if (tituloCompleto) {
        // Se tiver vírgula ou traço, separar título e descrição
        const matchVirgula = tituloCompleto.match(/^(.+?),\s*(.+)$/);
        if (matchVirgula) {
          // Manter emojis no título - pegar a linha original e remover apenas após vírgula
          const emojis = linha.match(/^[\u{1F300}-\u{1F9FF}\s]+/u)?.[0] || '';
          receita.titulo = (emojis + matchVirgula[1].trim()).trim();
          receita.descricao = matchVirgula[2].trim();
          secaoAtual = '';
        } else if (tituloCompleto.includes('—')) {
          const partes = tituloCompleto.split(/\s+—\s+/);
          // Manter emojis no título
          const emojis = linha.match(/^[\u{1F300}-\u{1F9FF}\s]+/u)?.[0] || '';
          receita.titulo = (emojis + partes[0].trim()).trim();
          if (partes.length > 1) {
            receita.descricao = partes.slice(1).join(' — ').trim();
          }
          secaoAtual = '';
        } else {
          // Manter emojis no título - usar a linha original completa
          receita.titulo = linha.trim();
          // Descrição pode vir na próxima linha
        }
      } else {
        // Se não tem texto após emojis, o título é só os emojis (será preenchido na próxima linha)
        receita.titulo = linha.trim();
      }
      // Se tituloCompleto estiver vazio, manter secaoAtual = 'titulo' para pegar na próxima linha
    }
    else if (secaoAtual === 'titulo') {
      // Linha após o título pode ser o título (se estava vazio) ou a descrição
      const linhaLimpa = linha.trim();
      
      // Se a linha começa com emoji de seção conhecida, fechar seção de título
      if (linha.match(/^[⭐⏱🛒🔄👩‍🍳✨🔢💡⚠️➡️📌]/)) {
        secaoAtual = '';
      } else if (!receita.titulo && linhaLimpa) {
        // Se o título estava vazio, esta linha é o título (pode ter emojis)
        receita.titulo = linhaLimpa;
        secaoAtual = '';
      } else if (receita.titulo && linhaLimpa && !linha.match(/^[\u{1F300}-\u{1F9FF}]/u)) {
        // Se já tem título e não é um emoji de seção, esta linha é a descrição
        if (!receita.descricao) {
          receita.descricao = linhaLimpa;
        } else {
          receita.descricao += ' ' + linhaLimpa;
        }
        secaoAtual = '';
      } else if (receita.titulo && linhaLimpa && linha.match(/^[\u{1F300}-\u{1F9FF}]/u) && !linha.match(/^[⭐⏱🛒🔄👩‍🍳✨🔢💡⚠️➡️📌]/)) {
        // Se o título já tem emojis mas esta linha também tem emojis (não de seção), adicionar ao título
        receita.titulo += ' ' + linhaLimpa;
        secaoAtual = '';
      }
    }
    // Título SEM emoji (fallback) - para receitas que não começam com emoji
    // Ex: "Bombom Fit de Chocolate 70% com Morango e Granola Uma sobremesa fácil..."
    else if (!receita.titulo && 
             !linha.match(/^[⭐★⏱⏱️🛒🔄👩‍🍳✨🔢ℹ️💡⚠️➡️📌]/) && 
             !linha.includes('|') && 
             linha.length > 3) {
      if (/\s+Uma\s+/i.test(linha)) {
        const partes = linha.split(/\s+Uma\s+/i);
        receita.titulo = partes[0].trim();
        receita.descricao = 'Uma ' + (partes[1] || '').trim();
      } else if (linha.includes(' — ')) {
        const partes = linha.split(/\s+—\s+/);
        receita.titulo = partes[0].trim();
        if (partes.length > 1) {
          receita.descricao = partes.slice(1).join(' — ').trim();
        }
      } else if (/^.+,\s+.+$/.test(linha)) {
        const idx = linha.indexOf(', ');
        receita.titulo = linha.substring(0, idx).trim();
        receita.descricao = linha.substring(idx + 2).trim();
      } else {
        receita.titulo = linha.trim();
      }
    }
    
    // Rendimento (aceita ⭐ ou ★, conteúdo na mesma linha ou na próxima)
    else if (/^[⭐★]\s*Rendimento/i.test(linha)) {
      const resto = linha.replace(/^[⭐★]\s*Rendimento\s*/i, '').trim();
      if (resto) {
        const match = resto.match(/(\d+)/);
        if (match) receita.porcoes = parseInt(match[1]);
        const matchRange = resto.match(/(\d+)\s*a\s*(\d+)/);
        if (matchRange) receita.porcoes = parseInt(matchRange[2]);
      } else {
        secaoAtual = 'rendimento';
      }
    }
    else if (secaoAtual === 'rendimento' && !linha.match(/^[⭐★⏱⏱️🛒🔄👩‍🍳✨🔢ℹ️💡⚠️➡️]/)) {
      const rendimento = linha.trim();
      const match = rendimento.match(/(\d+)/);
      if (match) receita.porcoes = parseInt(match[1]);
      const matchRange = rendimento.match(/(\d+)\s*a\s*(\d+)/);
      if (matchRange) receita.porcoes = parseInt(matchRange[2]);
      secaoAtual = '';
    }
    
    // Tempo Total (aceita ⏱ ou ⏱️, conteúdo na mesma linha ou na próxima)
    else if (/^⏱️?\s*Tempo Total/i.test(linha)) {
      const resto = linha.replace(/^⏱️?\s*Tempo Total\s*/i, '').trim();
      if (resto) {
        const match = resto.match(/(\d+)\s*minutos?/);
        if (match) receita.tempo_preparo = parseInt(match[1]);
        const matchRange = resto.match(/(\d+)\s*a\s*(\d+)/);
        if (matchRange) receita.tempo_preparo = parseInt(matchRange[2]);
      } else {
        secaoAtual = 'tempo';
      }
    }
    else if (secaoAtual === 'tempo' && !linha.match(/^[⭐★⏱⏱️🛒🔄👩‍🍳✨🔢ℹ️💡⚠️➡️]/)) {
      const tempoTexto = linha.trim();
      // Extrair minutos (ex: "Preparo: 5 minutos Air fryer: 6 a 7 minutos")
      const match = tempoTexto.match(/(\d+)\s*minutos?/);
      if (match) {
        receita.tempo_preparo = parseInt(match[1]);
      }
      // Se tiver range, pegar o maior
      const matchRange = tempoTexto.match(/(\d+)\s*a\s*(\d+)/);
      if (matchRange) {
        receita.tempo_preparo = parseInt(matchRange[2]);
      }
      secaoAtual = '';
    }
    
    // Ingredientes
    else if (linha.startsWith('🛒 Ingredientes')) {
      secaoAtual = 'ingredientes';
    }
    else if (secaoAtual === 'ingredientes') {
      if (linha.startsWith('*')) {
        const ingrediente = linha.replace('*', '').trim();
        if (ingrediente) {
          receita.ingredientes.push(ingrediente);
        }
      } else if (linha && !linha.match(/^[🔄👩‍🍳✨🔢💡⚠️➡️⭐⏱]/)) {
        // Capturar linha sem asterisco mas que parece ser ingrediente
        const ingrediente = linha.trim();
        if (ingrediente && !ingrediente.match(/^[A-Z][a-z]+\s*:/)) {
          receita.ingredientes.push(ingrediente);
        }
      }
      
      if (linha.startsWith('🔄')) {
        secaoAtual = 'substituicoes';
      } else if (linha.startsWith('👩‍🍳')) {
        secaoAtual = 'modo_preparo';
      }
    }
    
    // Substituições
    else if (linha.startsWith('🔄 Substituições')) {
      secaoAtual = 'substituicoes';
    }
    else if (secaoAtual === 'substituicoes' && linha.startsWith('*')) {
      const substituicao = linha.replace('*', '').trim();
      const match = substituicao.match(/^(.+?)\s*→\s*(.+)$/);
      if (match) {
        const ingrediente = match[1].trim();
        const substituto = match[2].trim();
        receita.substituicoes_ingredientes[ingrediente] = substituto;
      }
    }
    else if (secaoAtual === 'substituicoes' && linha.startsWith('👩‍🍳')) {
      secaoAtual = 'modo_preparo';
    }
    
    // Modo de Preparo
    else if (linha.startsWith('👩‍🍳 Modo de Preparo')) {
      secaoAtual = 'modo_preparo';
    }
    else if (secaoAtual === 'modo_preparo' && /^\d+\./.test(linha)) {
      receita.modo_preparo.push(linha.replace(/^\d+\.\s*/, '').trim());
    }
    else if (secaoAtual === 'modo_preparo' && linha.startsWith('✨')) {
      secaoAtual = '';
    }
    
    // Finalização
    else if (linha.startsWith('✨ Finalização')) {
      secaoAtual = 'finalizacao';
    }
    else if (secaoAtual === 'finalizacao' && !linha.match(/^[⭐⏱🛒🔄👩‍🍳✨🔢💡⚠️➡️]/)) {
      const finalizacao = linha.trim();
      if (finalizacao) {
        receita.modo_preparo.push(`Finalização: ${finalizacao}`);
      }
      secaoAtual = '';
    }
    
    // Resultado (conteúdo na mesma linha ou na próxima)
    else if (linha.startsWith('✨ Resultado')) {
      const resto = linha.replace(/^✨\s*Resultado\s*/, '').trim();
      if (resto) {
        if (!receita.descricao.includes(resto)) {
          receita.descricao += (receita.descricao ? ' ' : '') + resto;
        }
      } else {
        secaoAtual = 'resultado';
      }
    }
    else if (secaoAtual === 'resultado' && !linha.match(/^[⭐★⏱⏱️🛒🔄👩‍🍳✨🔢ℹ️💡⚠️➡️]/)) {
      const resultado = linha.trim();
      if (resultado && !receita.descricao.includes(resultado)) {
        receita.descricao += (receita.descricao ? ' ' : '') + resultado;
      }
      secaoAtual = '';
    }
    
    // Informação Nutricional (regex flexível - o 🔢/ℹ️ pode variar com encoding)
    else if (/Informação Nutricional/i.test(linha) && secaoAtual !== 'nutricional') {
      secaoAtual = 'nutricional';
      // Extrair conteúdo na mesma linha (ex: "👉 Por unidade" ou "Por porção")
      const resto = linha.replace(/^.*?Informação Nutricional\s*(?:Aproximada\s*)?/i, '').trim();
      if (resto) {
        const matchPor = resto.match(/👉\s*(.+)/);
        const textoPor = matchPor ? matchPor[1].trim() : resto.replace(/^👉\s*/, '').trim();
        if (textoPor) {
          receita.informacoes_nutricionais = textoPor;
        }
        // Se tiver * items na mesma linha (ex: "👉 Por unidade * Calorias: ~70 kcal")
        const partes = resto.split(/\s*\*\s*/).map(p => p.trim()).filter(p => p);
        for (const parte of partes) {
          if (parte.match(/^(Calorias|Proteínas|Gorduras|Carboidratos|Fibras):/i)) {
            receita.informacoes_nutricionais += (receita.informacoes_nutricionais ? '\n' : '') + parte;
          }
        }
      }
    }
    else if (secaoAtual === 'nutricional' && linha.startsWith('👉')) {
      // Pular linha de "👉 Por unidade" (já pode ter sido capturado acima)
      const resto = linha.replace(/^👉\s*/, '').trim();
      if (resto && !receita.informacoes_nutricionais) {
        receita.informacoes_nutricionais = resto;
      }
    }
    else if (secaoAtual === 'nutricional' && (/^[\*•∙‣\-]\s?/.test(linha) || /^(Calorias|Proteínas|Gorduras|Carboidratos|Fibras):/i.test(linha.trim()))) {
      // Aceita * ou • ou ∙ ou ‣ ou - como marcador, ou linha que começa com Calorias/Proteínas/etc
      const info = linha.replace(/^[\*•∙‣\-]\s*/, '').trim();
      receita.informacoes_nutricionais += (receita.informacoes_nutricionais ? '\n' : '') + info;
      
      // Extrair valores numéricos
      const caloriasMatch = info.match(/Calorias:\s*~?(\d+)/i);
      if (caloriasMatch) {
        receita.calorias = parseInt(caloriasMatch[1]);
      }
      
      const proteinasMatch = info.match(/Proteínas:\s*~?(\d+)/i);
      if (proteinasMatch) {
        receita.proteinas = parseFloat(proteinasMatch[1]);
      }
      
      const gordurasMatch = info.match(/Gorduras:\s*~?(\d+)/i);
      if (gordurasMatch) {
        receita.gorduras = parseFloat(gordurasMatch[1]);
      }
      
      const carboidratosMatch = info.match(/Carboidratos:\s*~?(\d+)/i);
      if (carboidratosMatch) {
        receita.carboidratos = parseFloat(carboidratosMatch[1]);
      }
    }
    else if (secaoAtual === 'nutricional' && linha.startsWith('➡️')) {
      // Linha com ➡️ vai para o AVISO NUTRICIONAL, não para informações nutricionais
      const info = linha.replace('➡️', '').trim();
      if (info) {
        // Adicionar ao aviso nutricional (será combinado com o aviso simples depois)
        if (!receita.aviso_nutricional) {
          receita.aviso_nutricional = info;
        } else {
          receita.aviso_nutricional = info + '. ' + receita.aviso_nutricional;
        }
      }
      secaoAtual = ''; // Fechar seção nutricional
    }
    else if (secaoAtual === 'nutricional' && !linha.startsWith('💡') && !linha.startsWith('⚠️')) {
      // Outras linhas na seção nutricional
      if (linha.trim()) {
        receita.informacoes_nutricionais += (receita.informacoes_nutricionais ? '\n' : '') + linha.trim();
      }
    }
    
    // Aviso Nutricional (deve vir DEPOIS da informação nutricional)
    else if (linha.startsWith('⚠️')) {
      secaoAtual = 'aviso';
      const aviso = linha.replace('⚠️', '').trim();
      // Remover "Aviso simples" se estiver presente
      const avisoLimpo = aviso.replace(/^Aviso simples\s*/i, '').trim();
      
      // Combinar com o texto do ➡️ se já existir
      if (receita.aviso_nutricional) {
        receita.aviso_nutricional = receita.aviso_nutricional + '. ' + avisoLimpo;
      } else {
        receita.aviso_nutricional = avisoLimpo;
      }
    }
    else if (secaoAtual === 'aviso' && !linha.match(/^[⭐⏱🛒🔄👩‍🍳✨🔢💡⚠️➡️]/)) {
      const aviso = linha.trim();
      if (aviso) {
        receita.aviso_nutricional += (receita.aviso_nutricional ? ' ' : '') + aviso;
      }
      secaoAtual = '';
    }
    
    // Dica final (conteúdo na mesma linha ou na próxima)
    else if (linha.startsWith('💡 Dica final')) {
      const resto = linha.replace(/^💡\s*Dica final\s*/, '').trim();
      if (resto) {
        receita.modo_preparo.push(`Dica: ${resto}`);
      } else {
        secaoAtual = 'dica';
      }
    }
    else if (secaoAtual === 'dica' && !linha.match(/^[⭐★⏱⏱️🛒🔄👩‍🍳✨🔢ℹ️💡⚠️➡️]/)) {
      const dica = linha.trim();
      if (dica) {
        receita.modo_preparo.push(`Dica: ${dica}`);
      }
      secaoAtual = '';
    }
  }

  // Determinar tipo_refeicao baseado nas tags
  if (receita.tags.some(t => t.toLowerCase().includes('sobremesa'))) {
    receita.tipo_refeicao = 'snacks';
  }

  // Limpar valores null/undefined
  Object.keys(receita).forEach(key => {
    if (receita[key] === null || receita[key] === undefined || 
        (Array.isArray(receita[key]) && receita[key].length === 0 && key !== 'ingredientes' && key !== 'modo_preparo')) {
      delete receita[key];
    }
  });

  // Se substituicoes_ingredientes estiver vazio, remover
  if (Object.keys(receita.substituicoes_ingredientes || {}).length === 0) {
    delete receita.substituicoes_ingredientes;
  }

  return receita;
}

// Configurações da API
const API_URL = process.env.API_URL || 'http://localhost:3001';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'dai@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Senha123';

// Cores para console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

async function login() {
  try {
    console.log(`${colors.cyan}🔐 Fazendo login como admin...${colors.reset}`);
    
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      senha: ADMIN_PASSWORD,
    }, {
      timeout: 5000,
    });
    
    if (!response.data.access_token) {
      throw new Error('Token de acesso não recebido');
    }
    
    console.log(`${colors.green}✅ Login realizado com sucesso!${colors.reset}`);
    return response.data.access_token;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error(`${colors.red}❌ Erro: Não foi possível conectar à API em ${API_URL}${colors.reset}`);
      console.error(`${colors.yellow}   Certifique-se de que a API está rodando (npm run start:dev na pasta api)${colors.reset}`);
    } else if (error.response) {
      console.error(`${colors.red}❌ Erro ao fazer login:${colors.reset}`);
      console.error(`${colors.red}   Status: ${error.response.status}${colors.reset}`);
      console.error(`${colors.red}   Mensagem: ${JSON.stringify(error.response.data)}${colors.reset}`);
    } else {
      console.error(`${colors.red}❌ Erro ao fazer login:${colors.reset}`, error.message);
    }
    throw error;
  }
}

async function verificarReceitaExistenteNoBanco(token, titulo) {
  try {
    const tituloLimpo = titulo.replace(/[🍫🍽️🥗🥘🍲🍳🥞🧇🍞🥐🥖🥨🥯🥪🌮🌯🥙🥗🥘🍝🍜🍲🍱🍣🍤🍥🥮🍢🍡🍧🍨🍦🥧🍰🎂🍮🍭🍬🍫🍿🍩🍪🌰🥜🍯🥛🍼☕🍵🥤🍶🍺🍻🥂🍷🥃🍸🍹🍾🥡🥢🍴🍽️]/g, '').trim();
    const searchTerm = encodeURIComponent(tituloLimpo);
    
    const response = await axios.get(
      `${API_URL}/receitas?search=${searchTerm}&incluirInativas=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (Array.isArray(response.data) && response.data.length > 0) {
      const receitaExistente = response.data.find(
        r => {
          const tituloExistente = (r.titulo || '').replace(/[🍫🍽️🥗🥘🍲🍳🥞🧇🍞🥐🥖🥨🥯🥪🌮🌯🥙🥗🥘🍝🍜🍲🍱🍣🍤🍥🥮🍢🍡🍧🍨🍦🥧🍰🎂🍮🍭🍬🍫🍿🍩🍪🌰🥜🍯🥛🍼☕🍵🥤🍶🍺🍻🥂🍷🥃🍸🍹🍾🥡🥢🍴🍽️]/g, '').trim();
          return tituloExistente.toLowerCase() === tituloLimpo.toLowerCase();
        }
      );
      
      if (receitaExistente) {
        return { existe: true, receita: receitaExistente };
      }
    }

    return { existe: false };
  } catch (error) {
    console.log(`${colors.yellow}  ⚠️  Erro ao verificar receita no banco: ${error.message}${colors.reset}`);
    return { existe: false };
  }
}

async function cadastrarReceitaNoBanco(token, receita) {
  try {
    // Verificar se já existe no banco
    const verificacao = await verificarReceitaExistenteNoBanco(token, receita.titulo);
    if (verificacao.existe) {
      return {
        success: false,
        error: `Receita já existe no banco com ID: ${verificacao.receita.id}`,
        duplicata: true,
      };
    }

    // Preparar dados da receita
    const dadosReceita = {
      titulo: receita.titulo,
      descricao: receita.descricao || '',
      ingredientes: receita.ingredientes || [],
      modo_preparo: receita.modo_preparo || [],
      tempo_preparo: receita.tempo_preparo || 0,
      porcoes: receita.porcoes || 1,
      dificuldade: receita.dificuldade || 'medio',
      tipo_refeicao: receita.tipo_refeicao,
      imagem_url: receita.imagem_url,
      imagens_url: receita.imagens_url || [],
      video_url: receita.video_url,
      ebook_url: receita.ebook_url,
      tags: receita.tags || [],
      is_premium: receita.is_premium !== undefined ? receita.is_premium : false,
      is_free: receita.is_free !== undefined ? receita.is_free : true,
      informacoes_nutricionais: receita.informacoes_nutricionais,
      aviso_nutricional: receita.aviso_nutricional,
      substituicoes_ingredientes: receita.substituicoes_ingredientes,
    };

    // Remover campos undefined/null
    Object.keys(dadosReceita).forEach(key => {
      if (dadosReceita[key] === undefined || dadosReceita[key] === null) {
        delete dadosReceita[key];
      }
    });

    // Remover substituicoes_ingredientes se estiver vazio
    if (dadosReceita.substituicoes_ingredientes && Object.keys(dadosReceita.substituicoes_ingredientes).length === 0) {
      delete dadosReceita.substituicoes_ingredientes;
    }

    console.log(`${colors.cyan}📤 Cadastrando receita no banco...${colors.reset}`);
    console.log(`${colors.yellow}   Premium: ${dadosReceita.is_premium ? 'SIM' : 'NÃO'}${colors.reset}`);
    console.log(`${colors.yellow}   Free: ${dadosReceita.is_free ? 'SIM' : 'NÃO'}${colors.reset}`);

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

    // Se a receita tiver campos nutricionais numéricos, atualizar após criação
    if (receita.calorias || receita.proteinas || receita.carboidratos || receita.gorduras || receita.fibras || receita.sodio) {
      const dadosNutricionais = {};
      if (receita.calorias !== undefined) dadosNutricionais.calorias = receita.calorias;
      if (receita.proteinas !== undefined) dadosNutricionais.proteinas = receita.proteinas;
      if (receita.carboidratos !== undefined) dadosNutricionais.carboidratos = receita.carboidratos;
      if (receita.gorduras !== undefined) dadosNutricionais.gorduras = receita.gorduras;
      if (receita.fibras !== undefined) dadosNutricionais.fibras = receita.fibras;
      if (receita.sodio !== undefined) dadosNutricionais.sodio = receita.sodio;

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
      } catch (updateError) {
        console.log(`${colors.yellow}  ⚠️  Receita criada, mas erro ao atualizar dados nutricionais: ${updateError.message}${colors.reset}`);
      }
    }

    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
}

async function main() {
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  🍽️  Adicionar e Cadastrar Receita${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  const receitasPath = path.join(__dirname, 'receitas.json');
  
  // Parse da receita
  console.log(`${colors.cyan}📝 Parseando receita...${colors.reset}`);
  const novaReceita = parseReceita(receitaTexto);
  
  console.log(`\n${colors.green}✅ Receita parseada:${colors.reset}`);
  console.log(`${colors.cyan}   Título: ${novaReceita.titulo}${colors.reset}`);
  console.log(`${colors.cyan}   Premium: ${novaReceita.is_premium ? 'SIM' : 'NÃO'}${colors.reset}`);
  console.log(`${colors.cyan}   Free: ${novaReceita.is_free ? 'SIM' : 'NÃO'}${colors.reset}`);
  if (novaReceita.informacoes_nutricionais) {
    console.log(`${colors.cyan}   Info nutricional: ${novaReceita.informacoes_nutricionais.substring(0, 60)}...${colors.reset}`);
  }
  console.log('');
  
  // Ler receitas existentes
  let receitas = [];
  if (fs.existsSync(receitasPath)) {
    try {
      const content = fs.readFileSync(receitasPath, 'utf8');
      receitas = JSON.parse(content);
      if (!Array.isArray(receitas)) {
        receitas = [];
      }
    } catch (error) {
      console.error(`${colors.red}❌ Erro ao ler receitas.json:${colors.reset}`, error.message);
      receitas = [];
    }
  }
  
  // Verificar se já existe no arquivo (por título)
  const tituloLimpo = novaReceita.titulo.replace(/[🍫🍽️🥗🥘🍲🍳🥞🧇🍞🥐🥖🥨🥯🥪🌮🌯🥙🥗🥘🍝🍜🍲🍱🍣🍤🍥🥮🍢🍡🍧🍨🍦🥧🍰🎂🍮🍭🍬🍫🍿🍩🍪🌰🥜🍯🥛🍼☕🍵🥤🍶🍺🍻🥂🍷🥃🍸🍹🍾🥡🥢🍴🍽️]/g, '').trim();
  const existeNoArquivo = receitas.some(r => {
    const tituloExistente = (r.titulo || '').replace(/[🍫🍽️🥗🥘🍲🍳🥞🧇🍞🥐🥖🥨🥯🥪🌮🌯🥙🥗🥘🍝🍜🍲🍱🍣🍤🍥🥮🍢🍡🍧🍨🍦🥧🍰🎂🍮🍭🍬🍫🍿🍩🍪🌰🥜🍯🥛🍼☕🍵🥤🍶🍺🍻🥂🍷🥃🍸🍹🍾🥡🥢🍴🍽️]/g, '').trim();
    return tituloExistente.toLowerCase() === tituloLimpo.toLowerCase();
  });
  
  if (existeNoArquivo) {
    console.log(`${colors.yellow}⚠️  Receita já existe no arquivo receitas.json!${colors.reset}\n`);
  } else {
    // Adicionar nova receita ao arquivo
    receitas.push(novaReceita);
    fs.writeFileSync(receitasPath, JSON.stringify(receitas, null, 2), 'utf8');
    console.log(`${colors.green}✅ Receita adicionada ao receitas.json!${colors.reset}`);
    console.log(`${colors.cyan}📊 Total de receitas no arquivo: ${receitas.length}${colors.reset}\n`);
  }
  
  // Cadastrar no banco de dados
  console.log(`${colors.cyan}🚀 Cadastrando receita no banco de dados...${colors.reset}\n`);
  
  let token;
  try {
    token = await login();
  } catch (error) {
    console.error(`${colors.red}❌ Não foi possível fazer login. Verifique as credenciais e se a API está rodando.${colors.reset}`);
    return;
  }
  
  const resultado = await cadastrarReceitaNoBanco(token, novaReceita);
  
  if (resultado.success) {
    console.log(`${colors.green}✅ Receita cadastrada no banco com sucesso!${colors.reset}`);
    console.log(`${colors.green}   ID: ${resultado.data.id}${colors.reset}\n`);
  } else if (resultado.duplicata) {
    console.log(`${colors.yellow}⚠️  Receita já existe no banco de dados!${colors.reset}`);
    console.log(`${colors.yellow}   ${resultado.error}${colors.reset}\n`);
  } else {
    console.log(`${colors.red}❌ Erro ao cadastrar receita no banco:${colors.reset}`);
    console.log(`${colors.red}   ${JSON.stringify(resultado.error)}${colors.reset}\n`);
  }
}

main().catch(error => {
  console.error(`${colors.red}❌ Erro fatal:${colors.reset}`, error);
  process.exit(1);
});
