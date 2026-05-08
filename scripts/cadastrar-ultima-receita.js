/**
 * Script para cadastrar APENAS a última receita adicionada ao receitas.json
 * 
 * USO:
 * node scripts/cadastrar-ultima-receita.js
 * 
 * Este script:
 * - Lê apenas a última receita do receitas.json
 * - Verifica se já existe no banco
 * - Cadastra apenas se não existir
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../api/.env') });

// Configurações
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

    console.log(`${colors.cyan}📤 Cadastrando receita: ${receita.titulo}${colors.reset}`);
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
      receita: receita.titulo,
    };
  }
}

async function main() {
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  🍽️  Cadastro da Última Receita${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  // Verificar se o arquivo de receitas existe
  const receitasPath = path.join(__dirname, 'receitas.json');
  if (!fs.existsSync(receitasPath)) {
    console.error(`${colors.red}❌ Arquivo receitas.json não encontrado!${colors.reset}`);
    return;
  }

  // Ler receitas do arquivo
  let receitas;
  try {
    const receitasContent = fs.readFileSync(receitasPath, 'utf8');
    receitas = JSON.parse(receitasContent);
    
    if (!Array.isArray(receitas) || receitas.length === 0) {
      console.error(`${colors.red}❌ Nenhuma receita encontrada no arquivo!${colors.reset}`);
      return;
    }
  } catch (error) {
    console.error(`${colors.red}❌ Erro ao ler receitas.json:${colors.reset}`, error.message);
    return;
  }

  // Pegar apenas a última receita
  const ultimaReceita = receitas[receitas.length - 1];
  console.log(`${colors.cyan}📚 Última receita encontrada: ${ultimaReceita.titulo}${colors.reset}\n`);

  // Fazer login
  let token;
  try {
    token = await login();
  } catch (error) {
    console.error(`${colors.red}❌ Não foi possível fazer login. Verifique as credenciais.${colors.reset}`);
    return;
  }

  // Cadastrar apenas a última receita
  console.log(`${colors.cyan}🚀 Cadastrando receita...${colors.reset}\n`);
  
  const resultado = await criarReceita(token, ultimaReceita);
  
  if (resultado.success) {
    console.log(`${colors.green}✅ Receita cadastrada com sucesso!${colors.reset}`);
    console.log(`${colors.green}   ID: ${resultado.data.id}${colors.reset}\n`);
  } else if (resultado.duplicata) {
    console.log(`${colors.yellow}⚠️  Receita já existe no banco de dados!${colors.reset}`);
    console.log(`${colors.yellow}   ${resultado.error}${colors.reset}\n`);
  } else {
    console.log(`${colors.red}❌ Erro ao cadastrar receita:${colors.reset}`);
    console.log(`${colors.red}   ${JSON.stringify(resultado.error)}${colors.reset}\n`);
  }
}

// Executar
main().catch(error => {
  console.error(`${colors.red}❌ Erro fatal:${colors.reset}`, error);
  process.exit(1);
});
