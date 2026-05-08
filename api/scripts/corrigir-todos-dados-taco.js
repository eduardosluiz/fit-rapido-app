const XLSX = require('xlsx');
const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

// Tentar carregar .env de múltiplos locais possíveis
const envPaths = [
  path.join(__dirname, '../.env'),
  path.join(__dirname, '../.env.local'),
  path.join(__dirname, '../../.env'),
  path.join(__dirname, '../../.env.local'),
  '.env',
  '.env.local',
];

let envLoaded = false;
for (const envPath of envPaths) {
  const fullPath = path.isAbsolute(envPath) ? envPath : path.resolve(process.cwd(), envPath);
  if (fs.existsSync(fullPath)) {
    require('dotenv').config({ path: fullPath });
    envLoaded = true;
    break;
  }
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não encontrada no .env');
  process.exit(1);
}

const caminhoArquivo = process.argv[2];

if (!caminhoArquivo) {
  console.error('❌ Uso: node corrigir-todos-dados-taco.js <caminho-do-arquivo.xlsx>');
  process.exit(1);
}

if (!fs.existsSync(caminhoArquivo)) {
  console.error(`❌ Arquivo não encontrado: ${caminhoArquivo}`);
  process.exit(1);
}

async function corrigirTodosDados() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado!');

    console.log(`\n📖 Lendo arquivo TACO: ${caminhoArquivo}`);
    const workbook = XLSX.readFile(caminhoArquivo);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

    // Estrutura conhecida do TACO:
    // Linha 3 (índice 3): Header completo
    // Linha 4+ (índice 4+): Dados
    // Coluna [0]: Número do alimento
    // Coluna [1]: Nome do alimento (Descrição dos alimentos)
    // Coluna [3]: Calorias (kcal)
    // Coluna [5]: Proteína (g) - linha 2 tem "Proteína"
    // Coluna [6]: Lipídeos/Gorduras (g) - linha 2 tem "Lipídeos"
    // Coluna [8]: Carboidrato (g) - linha 2 tem "Carboidrato"
    // Coluna [9]: Fibra Alimentar (g) - linha 2 tem "Fibra Alimentar"
    // Coluna [17]: Sódio (mg) - linha 2 tem "Sódio"

    console.log('\n📊 Criando mapa completo de dados do arquivo TACO...');
    const mapaDados = new Map();

    // Processar dados a partir da linha 5 (índice 4)
    for (let i = 4; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length < 10) continue;

      const numero = String(row[0] || '').trim();
      const nome = String(row[1] || '').trim();

      // Validar que é um número válido e nome válido
      if (/^\d+$/.test(numero) && nome && nome.length > 2 && nome !== 'NA' && nome !== 'Tr') {
        // Extrair valores nutricionais
        const calorias = parseFloat(row[3] || 0) || 0;
        const proteinas = parseFloat(row[5] || 0) || 0;
        const carboidratos = parseFloat(row[8] || 0) || 0;
        const gorduras = parseFloat(row[6] || 0) || 0;
        const fibras = parseFloat(row[9] || 0) || null;
        const sodio = parseFloat(row[17] || 0) || null;

        mapaDados.set(numero, {
          nome,
          calorias,
          proteinas,
          carboidratos,
          gorduras,
          fibras: fibras > 0 ? fibras : null,
          sodio: sodio > 0 ? sodio : null,
        });
      }
    }

    console.log(`✅ Mapa criado com ${mapaDados.size} ingredientes`);

    // Buscar TODOS os ingredientes no banco
    console.log('\n🔍 Buscando ingredientes no banco...');
    const ingredientes = await client.query(`
      SELECT id, nome, calorias, proteinas, carboidratos, gorduras, fibras, sodio
      FROM ingredientes
      ORDER BY nome
    `);

    console.log(`📋 Encontrados ${ingredientes.rows.length} ingredientes no banco\n`);

    if (ingredientes.rows.length === 0) {
      console.log('✅ Nenhum ingrediente no banco!');
      await client.end();
      return;
    }

    let atualizados = 0;
    let naoEncontrados = 0;
    let erros = 0;
    let semMudancas = 0;

    // Tentar encontrar correspondência por número ou nome
    for (const ing of ingredientes.rows) {
      let dadosTACO = null;
      
      // Tentar encontrar por número (se nome for número)
      if (/^\d+$/.test(ing.nome)) {
        dadosTACO = mapaDados.get(ing.nome);
      }
      
      // Se não encontrou por número, tentar por nome
      if (!dadosTACO) {
        for (const [numero, dados] of mapaDados.entries()) {
          if (dados.nome.toLowerCase() === ing.nome.toLowerCase()) {
            dadosTACO = dados;
            break;
          }
        }
      }

      if (!dadosTACO) {
        naoEncontrados++;
        continue;
      }

      try {
        // Verificar se precisa atualizar
        const precisaAtualizar = 
          ing.nome !== dadosTACO.nome ||
          Math.abs(parseFloat(ing.calorias) - dadosTACO.calorias) > 0.01 ||
          Math.abs(parseFloat(ing.proteinas) - dadosTACO.proteinas) > 0.01 ||
          Math.abs(parseFloat(ing.carboidratos) - dadosTACO.carboidratos) > 0.01 ||
          Math.abs(parseFloat(ing.gorduras) - dadosTACO.gorduras) > 0.01;

        if (!precisaAtualizar) {
          semMudancas++;
          continue;
        }

        // Atualizar todos os dados
        await client.query(
          `UPDATE ingredientes 
           SET nome = $1, 
               calorias = $2, 
               proteinas = $3, 
               carboidratos = $4, 
               gorduras = $5, 
               fibras = $6, 
               sodio = $7
           WHERE id = $8`,
          [
            dadosTACO.nome,
            dadosTACO.calorias,
            dadosTACO.proteinas,
            dadosTACO.carboidratos,
            dadosTACO.gorduras,
            dadosTACO.fibras,
            dadosTACO.sodio,
            ing.id
          ]
        );

        console.log(`✅ "${dadosTACO.nome.substring(0, 40)}" - C:${dadosTACO.calorias.toFixed(1)} P:${dadosTACO.proteinas.toFixed(1)} C:${dadosTACO.carboidratos.toFixed(1)} G:${dadosTACO.gorduras.toFixed(1)}`);
        atualizados++;
      } catch (error) {
        console.error(`❌ Erro ao atualizar ${ing.nome}:`, error.message);
        erros++;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 RESUMO DA CORREÇÃO:');
    console.log('='.repeat(80));
    console.log(`✅ Atualizados: ${atualizados}`);
    console.log(`⏭️  Sem mudanças necessárias: ${semMudancas}`);
    console.log(`⚠️  Não encontrados no TACO: ${naoEncontrados}`);
    console.log(`❌ Erros: ${erros}`);
    console.log(`📋 Total processado: ${ingredientes.rows.length}`);

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Conexão encerrada.');
  }
}

corrigirTodosDados();

