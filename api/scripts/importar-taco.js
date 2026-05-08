/**
 * Script para importar dados do TACO (Tabela Brasileira de Composição de Alimentos)
 * 
 * Uso:
 * 1. Baixe o arquivo XLS do TACO: http://www.nepa.unicamp.br/taco/tabela.php
 * 2. Converta para CSV ou use este script com xlsx
 * 3. Execute: node api/scripts/importar-taco.js caminho/para/arquivo.xls
 * 
 * Dependências:
 * npm install xlsx pg dotenv
 */

const XLSX = require('xlsx');
const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

// Tentar carregar .env de múltiplos locais possíveis
const envPaths = [
  path.join(__dirname, '../.env'),        // api/.env (PRIMEIRO - mais provável)
  path.join(__dirname, '../.env.local'),  // api/.env.local
  path.join(__dirname, '../../.env'),     // raiz/.env
  path.join(__dirname, '../../.env.local'), // raiz/.env.local
  path.join(__dirname, '../../../.env'),  // raiz/.env (alternativo)
  '.env',                                 // diretório atual
  '.env.local',                           // diretório atual (local)
];

let envLoaded = false;
let loadedPath = null;

for (const envPath of envPaths) {
  const fullPath = path.isAbsolute(envPath) ? envPath : path.resolve(process.cwd(), envPath);
  if (fs.existsSync(fullPath)) {
    require('dotenv').config({ path: fullPath });
    loadedPath = fullPath;
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('⚠️  Arquivo .env não encontrado nos locais esperados.');
  console.warn('   Locais verificados:');
  envPaths.forEach(p => {
    const fullPath = path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
    console.warn(`     - ${fullPath}`);
  });
  console.warn('   Tentando usar variáveis de ambiente do sistema...');
  require('dotenv').config(); // Tentar carregar do sistema
} else {
  console.log(`✅ Arquivo .env carregado de: ${loadedPath}`);
}

// Validar DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('\n❌ ERRO: DATABASE_URL não encontrada nas variáveis de ambiente!');
  console.error('\n📋 Soluções possíveis:');
  console.error('   1. Certifique-se de que existe um arquivo .env na raiz do projeto');
  console.error('   2. O arquivo .env deve conter: DATABASE_URL="postgresql://..."');
  console.error('   3. Ou defina a variável de ambiente:');
  console.error('      Windows PowerShell: $env:DATABASE_URL="sua_url"');
  console.error('      Linux/Mac: export DATABASE_URL="sua_url"');
  console.error('\n💡 Dica: O arquivo .env deve estar na raiz do projeto (mesmo nível que api/)');
  process.exit(1);
}

// Mascarar senha na URL para exibição
const dbUrlDisplay = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@');
console.log(`🔗 Conectando ao banco: ${dbUrlDisplay}`);

// Mapeamento de colunas do TACO (ajuste conforme necessário)
const MAPEAMENTO_COLUNAS = {
  nome: 'Nome do Alimento',
  calorias: 'Energia (kcal)',
  proteinas: 'Proteína (g)',
  carboidratos: 'Carboidrato (g)',
  gorduras: 'Lipídeos (g)',
  fibras: 'Fibra Alimentar (g)',
  sodio: 'Sódio (mg)',
};

// Função para normalizar nome
function normalizarNome(nome) {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Função para encontrar coluna no header
function encontrarColuna(headers, nomeEsperado) {
  return headers.findIndex((h) => 
    h && h.toString().toLowerCase().includes(nomeEsperado.toLowerCase())
  );
}

async function importarTACO(caminhoArquivo) {
  // Validar arquivo existe
  if (!fs.existsSync(caminhoArquivo)) {
    throw new Error(`Arquivo não encontrado: ${caminhoArquivo}`);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Tentando conectar ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado ao banco de dados.');

    // Ler arquivo Excel
    console.log(`📖 Lendo arquivo: ${caminhoArquivo}`);
    const workbook = XLSX.readFile(caminhoArquivo);
    const sheetName = workbook.SheetNames[0]; // Primeira planilha
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

    if (data.length < 2) {
      throw new Error('Arquivo vazio ou sem dados');
    }

    // TACO tem estrutura específica:
    // Linha 0-2: Headers parciais
    // Linha 3: Header completo (índice 3 = linha 4)
    // Linha 4+: Dados (começam na linha 5 = índice 4)
    let headerRowIndex = 3; // Linha 4 do arquivo (índice 3)
    let headers = data[headerRowIndex] || [];
    
    // Se não encontrou, procurar linha com mais colunas
    if (headers.length === 0 || headers.filter(h => h).length < 3) {
      for (let i = 0; i < Math.min(5, data.length); i++) {
        const row = data[i];
        const filledCount = row.filter(c => c && String(c).trim() !== '').length;
        if (filledCount > headers.filter(c => c && String(c).trim() !== '').length) {
          headerRowIndex = i;
          headers = row;
        }
      }
    }

    console.log(`📋 Header encontrado na linha ${headerRowIndex + 1}:`, headers.slice(0, 15));
    console.log(`📊 Total de colunas: ${headers.length}`);

    // Mostrar todas as colunas para debug
    console.log('\n🔍 Todas as colunas encontradas:');
    headers.forEach((h, idx) => {
      if (h && String(h).trim() !== '') {
        console.log(`   [${idx}] ${h}`);
      }
    });

    // Mapeamento baseado na estrutura real do TACO (linha 3 = header)
    // Coluna [0]: "Alimento" (número)
    // Coluna [1]: "Descrição dos alimentos" (NOME DO ALIMENTO)
    // Coluna [3]: "(kcal)" (calorias)
    // Coluna [5]: "(g)" (proteína) - baseado na linha 2 que tem "Proteína"
    // Coluna [6]: "(g)" (lipídeos/gorduras) - baseado na linha 2 que tem "Lipídeos"
    // Coluna [8]: "(g)" (carboidrato) - baseado na linha 2 que tem "Carboidrato"
    // Coluna [9]: "(g)" (fibra alimentar) - baseado na linha 2 que tem "Fibra Alimentar"
    // Coluna [17]: "(mg)" (sódio) - baseado na linha 2 que tem "Sódio"
    
    // Verificar linha 2 para confirmar mapeamento
    const linha2 = data[1] || []; // Linha 2 do arquivo (índice 1)
    
    // Buscar índices baseado nos headers reais
    const indices = {
      nome: encontrarColuna(headers, 'descrição') !== -1 ? encontrarColuna(headers, 'descrição') :
            encontrarColuna(headers, 'descricao') !== -1 ? encontrarColuna(headers, 'descricao') :
            encontrarColuna(headers, 'desc') !== -1 ? encontrarColuna(headers, 'desc') :
            // Fallback: coluna [1] baseado na estrutura conhecida
            1,
      calorias: encontrarColuna(headers, 'kcal') !== -1 ? encontrarColuna(headers, 'kcal') :
                encontrarColuna(headers, 'energia') !== -1 ? encontrarColuna(headers, 'energia') :
                // Fallback: coluna [3] baseado na estrutura conhecida
                3,
      proteinas: encontrarColuna(linha2, 'proteína') !== -1 ? encontrarColuna(linha2, 'proteína') :
                 encontrarColuna(linha2, 'proteina') !== -1 ? encontrarColuna(linha2, 'proteina') :
                 // Fallback: coluna [5] baseado na estrutura conhecida
                 5,
      carboidratos: encontrarColuna(linha2, 'carboidrato') !== -1 ? encontrarColuna(linha2, 'carboidrato') :
                    encontrarColuna(linha2, 'carbo') !== -1 ? encontrarColuna(linha2, 'carbo') :
                    // Fallback: coluna [8] baseado na estrutura conhecida
                    8,
      gorduras: encontrarColuna(linha2, 'lipídeo') !== -1 ? encontrarColuna(linha2, 'lipídeo') :
                encontrarColuna(linha2, 'lipideo') !== -1 ? encontrarColuna(linha2, 'lipideo') :
                encontrarColuna(linha2, 'gordura') !== -1 ? encontrarColuna(linha2, 'gordura') :
                // Fallback: coluna [6] baseado na estrutura conhecida
                6,
      fibras: encontrarColuna(linha2, 'fibra') !== -1 ? encontrarColuna(linha2, 'fibra') :
              encontrarColuna(linha2, 'alimentar') !== -1 ? encontrarColuna(linha2, 'alimentar') :
              // Fallback: coluna [9] baseado na estrutura conhecida
              9,
      sodio: encontrarColuna(linha2, 'sódio') !== -1 ? encontrarColuna(linha2, 'sódio') :
             encontrarColuna(linha2, 'sodio') !== -1 ? encontrarColuna(linha2, 'sodio') :
             // Fallback: coluna [17] baseado na estrutura conhecida
             17,
    };

    console.log('\n📍 Índices das colunas encontrados:', indices);

    // Validar que encontrou pelo menos nome
    if (indices.nome === -1) {
      console.error('\n❌ ERRO: Coluna "Nome" não encontrada!');
      console.error('\n💡 O arquivo TACO pode ter um formato diferente.');
      console.error('   Por favor, verifique manualmente as colunas acima.');
      console.error('   Você pode ajustar o script em: api/scripts/importar-taco.js');
      throw new Error('Coluna "Nome" não encontrada no arquivo. Verifique o formato do arquivo TACO.');
    }

    let importados = 0;
    let ignorados = 0;
    let erros = 0;

    // Processar cada linha (pular linhas de header e categoria)
    // Dados começam na linha 5 (índice 4) - após header (linha 3) e categoria (linha 4)
    const startRow = Math.max(headerRowIndex + 1, 4); // Pelo menos linha 5 (índice 4)
    console.log(`\n🔄 Processando dados a partir da linha ${startRow + 1}...\n`);
    
    for (let i = startRow; i < data.length; i++) {
      const row = data[i];
      
      // Verificar se é linha de categoria (não tem número na coluna 0 ou nome na coluna 1)
      if (!row || row.length < 2) {
        continue; // Linha vazia ou incompleta
      }
      
      // Se coluna [0] não é número e coluna [1] está vazia, provavelmente é categoria
      const col0 = String(row[0] || '').trim();
      const col1 = String(row[indices.nome] || row[1] || '').trim();
      
      if (!col1 || col1.length < 2) {
        continue; // Linha sem nome válido
      }
      
      // Pular linhas de categoria (que não têm número na coluna 0)
      if (isNaN(parseInt(col0)) && col0.length > 0 && col1.length < 3) {
        continue; // Provavelmente é uma linha de categoria
      }

      try {
        // Nome está na coluna [1] "Descrição dos alimentos"
        const nome = String(row[indices.nome] || row[1] || '').trim();
        
        if (!nome || nome.length < 2 || nome === 'NA' || nome === 'Tr') {
          ignorados++;
          continue;
        }
        
        // Validar que não é apenas um número
        if (/^\d+$/.test(nome)) {
          ignorados++;
          continue; // Pular se for apenas número
        }

        // Extrair valores nutricionais (usar 0 se coluna não encontrada)
        const calorias = indices.calorias !== -1 ? (parseFloat(row[indices.calorias] || 0) || 0) : 0;
        const proteinas = indices.proteinas !== -1 ? (parseFloat(row[indices.proteinas] || 0) || 0) : 0;
        const carboidratos = indices.carboidratos !== -1 ? (parseFloat(row[indices.carboidratos] || 0) || 0) : 0;
        const gorduras = indices.gorduras !== -1 ? (parseFloat(row[indices.gorduras] || 0) || 0) : 0;
        const fibras = indices.fibras !== -1 ? (parseFloat(row[indices.fibras] || 0) || null) : null;
        const sodio = indices.sodio !== -1 ? (parseFloat(row[indices.sodio] || 0) || null) : null;

        // Validar dados mínimos
        if (calorias === 0 && proteinas === 0 && carboidratos === 0 && gorduras === 0) {
          console.warn(`⚠️  Ignorando ${nome}: sem dados nutricionais`);
          ignorados++;
          continue;
        }

        // Verificar se já existe
        const existe = await client.query(
          'SELECT id FROM ingredientes WHERE nome = $1',
          [nome]
        );

        if (existe.rows.length > 0) {
          console.log(`⏭️  ${nome} já existe, pulando...`);
          ignorados++;
          continue;
        }

        // Inserir ingrediente
        const result = await client.query(
          `INSERT INTO ingredientes (
            nome, unidade_base, calorias, proteinas, carboidratos, 
            gorduras, fibras, sodio, ativo, fonte, data_importacao
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
          RETURNING id, nome`,
          [
            nome,
            '100g',
            calorias,
            proteinas,
            carboidratos,
            gorduras,
            fibras,
            sodio,
            true,
            'manual',
          ]
        );

        console.log(`✅ Importado: ${nome} (${calorias} kcal)`);
        importados++;

      } catch (error) {
        console.error(`❌ Erro ao processar linha ${i + 1}:`, error.message);
        erros++;
      }
    }

    console.log('\n📊 Resumo da importação:');
    console.log(`   ✅ Importados: ${importados}`);
    console.log(`   ⏭️  Ignorados: ${ignorados}`);
    console.log(`   ❌ Erros: ${erros}`);
    console.log(`   📦 Total processado: ${importados + ignorados + erros}`);

  } catch (error) {
    console.error('❌ Erro na importação:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Conexão encerrada.');
  }
}

// Executar
const caminhoArquivo = process.argv[2];

if (!caminhoArquivo) {
  console.error('❌ Uso: node importar-taco.js <caminho/para/arquivo.xls>');
  console.error('   Exemplo: node importar-taco.js ../taco_4_edicao_2011.xls');
  process.exit(1);
}

importarTACO(caminhoArquivo);

