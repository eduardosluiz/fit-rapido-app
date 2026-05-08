const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../api/.env') });

const API_URL = process.env.API_URL || 'http://localhost:3001';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@fitrapido.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// IDs das receitas duplicadas criadas hoje (sem imagens) - devem ser removidas
const idsParaRemover = [
  'c2f2eed5-54a2-425a-9170-0cc464a7cdc6', // Banana Dourada (nova sem imagem)
  'b7f1e84a-e35e-4546-ac99-53dbdb53d236', // Bolo de Laranja (nova sem imagem)
  '710120c3-c7c3-4a3b-a285-5cca91568c18', // Bolinho de Brócolis (nova sem imagem)
  '70971a3f-c7c2-430d-ae34-4e069448f1e9', // Doce de Leite de Coco (nova sem imagem)
  '115d9466-df37-4223-8738-fffdcc421d4d', // Molho de Tomate (nova sem imagem)
  '5db812b4-b18f-4e72-9c4f-b34134abc4f1', // Pão de Queijo (nova sem imagem)
  '340c2689-2ce4-4c13-880c-7257ef521421', // Leite de Coco (nova sem imagem)
  '48688511-6c26-4611-8250-483929aab43c', // Coxinha Fit (nova sem imagem)
  '02f661a4-daa8-4492-a6f4-b4b74dd94175', // Creme de Castanhas (nova sem imagem)
];

// IDs das receitas antigas (com imagens) - devem ser mantidas
const idsParaManter = [
  '5e751afa-1f00-422b-8f51-56b80c45cb58', // Banana Dourada (antiga com imagem)
  '92f0f0c6-c6b2-43b1-af34-7794a1aed15d', // Bolo de Laranja (antiga com imagem)
  '6aaaab92-8643-4be1-ad03-2ab0122874bf', // Bolinho de Brócolis (antiga com imagem)
  '76a37b3d-e9dd-4f0d-8d4d-a40cddd8a211', // Doce de Leite de Coco (antiga com imagem)
  'dafc98ea-76f3-457c-be48-cb80bb4fbfd9', // Molho de Tomate (antiga com imagem)
  '0b7df92e-91c8-45d6-b265-5c6eca918859', // Pão de Queijo (antiga com imagem)
  '37499ff5-7000-4431-8d94-84b1d4206157', // Leite de Coco (antiga com imagem)
];

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
    });
    
    if (!response.data.access_token) {
      throw new Error('Token de acesso não recebido');
    }
    
    console.log(`${colors.green}✅ Login realizado com sucesso!${colors.reset}\n`);
    return response.data.access_token;
  } catch (error) {
    console.error(`${colors.red}❌ Erro ao fazer login:${colors.reset}`, error.message);
    throw error;
  }
}

async function removerReceita(token, id, titulo) {
  try {
    await axios.delete(`${API_URL}/receitas/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      titulo,
    };
  }
}

async function main() {
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  🗑️  Remoção de Receitas Duplicadas${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

  console.log(`${colors.yellow}⚠️  ATENÇÃO: Este script irá remover ${idsParaRemover.length} receitas duplicadas criadas hoje (sem imagens)${colors.reset}`);
  console.log(`${colors.green}✅ As receitas antigas (com imagens) serão mantidas${colors.reset}\n`);

  const token = await login();

  console.log(`${colors.cyan}🚀 Iniciando remoção de receitas duplicadas...${colors.reset}\n`);

  const resultados = {
    sucesso: [],
    erro: [],
  };

  for (let i = 0; i < idsParaRemover.length; i++) {
    const id = idsParaRemover[i];
    
    // Buscar título da receita antes de remover
    let titulo = `ID: ${id}`;
    try {
      const receita = await axios.get(`${API_URL}/receitas/${id}`);
      titulo = receita.data.titulo;
    } catch (e) {
      // Se não conseguir buscar, usar o ID
    }

    console.log(`${colors.blue}[${i + 1}/${idsParaRemover.length}]${colors.reset} Removendo: ${titulo}...`);

    const resultado = await removerReceita(token, id, titulo);

    if (resultado.success) {
      console.log(`${colors.green}  ✅ Removida com sucesso!${colors.reset}\n`);
      resultados.sucesso.push({ id, titulo });
    } else {
      console.log(`${colors.red}  ❌ Erro: ${JSON.stringify(resultado.error)}${colors.reset}\n`);
      resultados.erro.push({ id, titulo, erro: resultado.error });
    }

    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Resumo
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  📊 Resumo da Remoção${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}✅ Removidas: ${resultados.sucesso.length}${colors.reset}`);
  console.log(`${colors.red}❌ Erros: ${resultados.erro.length}${colors.reset}\n`);

  if (resultados.erro.length > 0) {
    console.log(`${colors.yellow}⚠️  Receitas com erro na remoção:${colors.reset}`);
    resultados.erro.forEach((item, index) => {
      console.log(`${index + 1}. ${item.titulo}`);
      console.log(`   Erro: ${JSON.stringify(item.erro)}`);
    });
  }

  console.log(`\n${colors.green}✅ Processo concluído!${colors.reset}`);
  console.log(`${colors.cyan}💡 As receitas antigas (com imagens) foram preservadas.${colors.reset}`);
}

main().catch(error => {
  console.error(`${colors.red}❌ Erro fatal:${colors.reset}`, error);
  process.exit(1);
});

