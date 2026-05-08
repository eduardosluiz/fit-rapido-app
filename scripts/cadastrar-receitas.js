/**
 * Script para cadastrar receitas automaticamente via API
 * 
 * USO:
 * 1. Edite o arquivo receitas.json com suas receitas
 * 2. Configure as credenciais de admin no .env (ou edite diretamente aqui)
 * 3. Execute: node scripts/cadastrar-receitas.js
 * 
 * FORMATO DAS RECEITAS (receitas.json):
 * [
 *   {
 *     "titulo": "Nome da Receita",
 *     "descricao": "Descrição da receita",
 *     "ingredientes": ["1 xícara de farinha", "2 ovos", ...],
 *     "modo_preparo": ["Passo 1", "Passo 2", ...],
 *     "tempo_preparo": 30,
 *     "porcoes": 4,
 *     "dificuldade": "facil" | "medio" | "dificil",
 *     "tipo_refeicao": "breakfast" | "lunch" | "dinner" | "snacks" | "drinks" | "sides",
 *     "imagem_url": "https://...",
 *     "imagens_url": ["https://...", "https://..."],
 *     "video_url": "https://...",
 *     "ebook_url": "https://...",
 *     "tags": ["tag1", "tag2"],
 *     "is_premium": false,
 *     "is_free": false,
 *     "ativa": true
 *   }
 * ]
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

async function login() {
  try {
    console.log(`${colors.cyan}🔐 Fazendo login como admin...${colors.reset}`);
    console.log(`${colors.yellow}   Email: ${ADMIN_EMAIL}${colors.reset}`);
    console.log(`${colors.yellow}   API URL: ${API_URL}${colors.reset}`);
    
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
      console.error(`${colors.yellow}   Verifique se as credenciais estão corretas no arquivo api/.env${colors.reset}`);
    } else {
      console.error(`${colors.red}❌ Erro ao fazer login:${colors.reset}`, error.message);
    }
    throw error;
  }
}

async function verificarReceitaExistente(token, titulo) {
  try {
    // Remover emojis e caracteres especiais para busca mais precisa
    const tituloLimpo = titulo.replace(/[🍫🍽️🥗🥘🍲🍳🥞🧇🍞🥐🥖🥨🥯🥪🌮🌯🥙🥗🥘🍝🍜🍲🍱🍣🍤🍥🥮🍢🍡🍧🍨🍦🥧🍰🎂🍮🍭🍬🍫🍿🍩🍪🌰🥜🍯🥛🍼☕🍵🥤🍶🍺🍻🥂🍷🥃🍸🍹🍾🥡🥢🍴🍽️]/g, '').trim();
    
    // Usar encodeURIComponent para evitar problemas com caracteres especiais
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
      // Verificar se há receita com título exato (case-insensitive)
      const receitaExistente = response.data.find(
        r => r.titulo && r.titulo.toLowerCase().trim() === titulo.toLowerCase().trim()
      );
      
      if (receitaExistente) {
        return { existe: true, receita: receitaExistente };
      }
    }

    return { existe: false };
  } catch (error) {
    // Se houver erro na busca, retornar false para tentar cadastrar mesmo assim
    console.log(`${colors.yellow}  ⚠️  Erro ao verificar receita existente: ${error.message}${colors.reset}`);
    return { existe: false };
  }
}

async function criarReceita(token, receita) {
  try {
    // Verificar se a receita já existe
    const verificacao = await verificarReceitaExistente(token, receita.titulo);
    if (verificacao.existe) {
      return {
        success: false,
        error: `Receita já existe com ID: ${verificacao.receita.id}`,
        receita: receita.titulo,
        duplicata: true,
      };
    }

    // Preparar dados da receita
    // Nota: Campos nutricionais numéricos (calorias, proteinas, etc.) não são aceitos no CreateReceitaDto
    // Eles devem ser atualizados após a criação usando UpdateReceitaDto
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
      is_premium: receita.is_premium || false,
      is_free: receita.is_free || false,
      informacoes_nutricionais: receita.informacoes_nutricionais,
      // Campos nutricionais numéricos serão atualizados após a criação
    };

    // Remover campos undefined/null
    Object.keys(dadosReceita).forEach(key => {
      if (dadosReceita[key] === undefined || dadosReceita[key] === null) {
        delete dadosReceita[key];
      }
    });

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
      receita: receita.titulo,
    };
  }
}

async function main() {
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  🍽️  Cadastro Automático de Receitas${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  // Verificar se o arquivo de receitas existe
  const receitasPath = path.join(__dirname, 'receitas.json');
  if (!fs.existsSync(receitasPath)) {
    console.log(`${colors.yellow}⚠️  Arquivo receitas.json não encontrado!${colors.reset}`);
    console.log(`${colors.cyan}📝 Criando arquivo de exemplo...${colors.reset}\n`);
    
    const exemplo = [
      {
        "titulo": "Exemplo de Receita",
        "descricao": "Esta é uma receita de exemplo",
        "ingredientes": [
          "1 xícara de farinha",
          "2 ovos",
          "1/2 xícara de açúcar"
        ],
        "modo_preparo": [
          "Misture todos os ingredientes",
          "Asse por 30 minutos"
        ],
        "tempo_preparo": 30,
        "porcoes": 4,
        "dificuldade": "facil",
        "tipo_refeicao": "breakfast",
        "tags": ["doce", "rápido"],
        "is_premium": false,
        "is_free": true,
        "ativa": true
      }
    ];
    
    fs.writeFileSync(receitasPath, JSON.stringify(exemplo, null, 2), 'utf8');
    console.log(`${colors.green}✅ Arquivo receitas.json criado!${colors.reset}`);
    console.log(`${colors.yellow}📝 Edite o arquivo e execute novamente o script.${colors.reset}\n`);
    return;
  }

  // Ler receitas do arquivo
  let receitas;
  try {
    const receitasContent = fs.readFileSync(receitasPath, 'utf8');
    receitas = JSON.parse(receitasContent);
    
    if (!Array.isArray(receitas)) {
      throw new Error('O arquivo deve conter um array de receitas');
    }
  } catch (error) {
    console.error(`${colors.red}❌ Erro ao ler receitas.json:${colors.reset}`, error.message);
    return;
  }

  console.log(`${colors.cyan}📚 Encontradas ${receitas.length} receita(s) para cadastrar${colors.reset}\n`);

  // Fazer login
  let token;
  try {
    token = await login();
  } catch (error) {
    console.error(`${colors.red}❌ Não foi possível fazer login. Verifique as credenciais.${colors.reset}`);
    return;
  }

  // Cadastrar receitas
  console.log(`${colors.cyan}🚀 Iniciando cadastro de receitas...${colors.reset}\n`);
  
  const resultados = {
    sucesso: [],
    erro: [],
    duplicatas: [],
  };

  for (let i = 0; i < receitas.length; i++) {
    const receita = receitas[i];
    console.log(`${colors.blue}[${i + 1}/${receitas.length}]${colors.reset} Verificando: ${receita.titulo}...`);
    
    const resultado = await criarReceita(token, receita);
    
    if (resultado.success) {
      console.log(`${colors.green}  ✅ Sucesso! ID: ${resultado.data.id}${colors.reset}\n`);
      resultados.sucesso.push({
        titulo: receita.titulo,
        id: resultado.data.id,
      });
    } else if (resultado.duplicata) {
      console.log(`${colors.yellow}  ⚠️  Receita já existe! ID: ${resultado.error.match(/ID: ([a-f0-9-]+)/)?.[1] || 'N/A'}${colors.reset}\n`);
      resultados.duplicatas.push({
        titulo: receita.titulo,
        erro: resultado.error,
      });
    } else {
      console.log(`${colors.red}  ❌ Erro: ${JSON.stringify(resultado.error)}${colors.reset}\n`);
      resultados.erro.push({
        titulo: receita.titulo,
        erro: resultado.error,
      });
    }

    // Pequeno delay para não sobrecarregar a API
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Resumo
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  📊 Resumo do Cadastro${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}✅ Sucesso: ${resultados.sucesso.length}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Duplicatas (já existem): ${resultados.duplicatas.length}${colors.reset}`);
  console.log(`${colors.red}❌ Erros: ${resultados.erro.length}${colors.reset}\n`);

  if (resultados.duplicatas.length > 0) {
    console.log(`${colors.yellow}⚠️  Receitas já cadastradas (ignoradas):${colors.reset}`);
    resultados.duplicatas.forEach((item, index) => {
      console.log(`${index + 1}. ${item.titulo}`);
    });
    console.log('');
  }

  if (resultados.erro.length > 0) {
    console.log(`${colors.yellow}⚠️  Receitas com erro:${colors.reset}`);
    resultados.erro.forEach((item, index) => {
      console.log(`${index + 1}. ${item.titulo}`);
      console.log(`   Erro: ${JSON.stringify(item.erro)}`);
    });
  }

  // Salvar log
  const logPath = path.join(__dirname, `cadastro-log-${Date.now()}.json`);
  fs.writeFileSync(logPath, JSON.stringify(resultados, null, 2), 'utf8');
  console.log(`\n${colors.cyan}📝 Log salvo em: ${logPath}${colors.reset}`);
}

// Executar
main().catch(error => {
  console.error(`${colors.red}❌ Erro fatal:${colors.reset}`, error);
  process.exit(1);
});

