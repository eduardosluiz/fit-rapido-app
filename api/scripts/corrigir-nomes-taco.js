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
  console.error('❌ Uso: node corrigir-nomes-taco.js <caminho-do-arquivo.xlsx>');
  process.exit(1);
}

if (!fs.existsSync(caminhoArquivo)) {
  console.error(`❌ Arquivo não encontrado: ${caminhoArquivo}`);
  process.exit(1);
}

async function corrigirNomes() {
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

    console.log('\n📊 Criando mapa de números → nomes do arquivo TACO...');
    const mapaNumerosNomes = new Map();

    // Processar dados a partir da linha 5 (índice 4)
    for (let i = 4; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length < 2) continue;

      const numero = String(row[0] || '').trim();
      const nome = String(row[1] || '').trim();

      // Validar que é um número válido e nome válido
      if (/^\d+$/.test(numero) && nome && nome.length > 2 && nome !== 'NA' && nome !== 'Tr') {
        mapaNumerosNomes.set(numero, nome);
      }
    }

    console.log(`✅ Mapa criado com ${mapaNumerosNomes.size} ingredientes`);

    // Buscar ingredientes no banco com nomes numéricos
    console.log('\n🔍 Buscando ingredientes com nomes numéricos no banco...');
    const ingredientes = await client.query(`
      SELECT id, nome, calorias
      FROM ingredientes
      WHERE nome ~ '^[0-9]+$'
      ORDER BY nome::integer
    `);

    console.log(`📋 Encontrados ${ingredientes.rows.length} ingredientes para corrigir\n`);

    if (ingredientes.rows.length === 0) {
      console.log('✅ Nenhum ingrediente precisa ser corrigido!');
      await client.end();
      return;
    }

    let atualizados = 0;
    let naoEncontrados = 0;
    let erros = 0;

    // Atualizar cada ingrediente
    for (const ing of ingredientes.rows) {
      const numeroAntigo = ing.nome;
      const novoNome = mapaNumerosNomes.get(numeroAntigo);

      if (!novoNome) {
        console.log(`⚠️  Número ${numeroAntigo} não encontrado no arquivo TACO`);
        naoEncontrados++;
        continue;
      }

      try {
        // Verificar se já existe ingrediente com este nome
        const existe = await client.query(
          'SELECT id FROM ingredientes WHERE nome = $1 AND id != $2',
          [novoNome, ing.id]
        );

        if (existe.rows.length > 0) {
          console.log(`⏭️  "${novoNome}" já existe, mantendo número "${numeroAntigo}"`);
          continue;
        }

        // Atualizar nome
        await client.query(
          'UPDATE ingredientes SET nome = $1 WHERE id = $2',
          [novoNome, ing.id]
        );

        console.log(`✅ ${numeroAntigo} → "${novoNome.substring(0, 50)}"`);
        atualizados++;
      } catch (error) {
        console.error(`❌ Erro ao atualizar ${numeroAntigo}:`, error.message);
        erros++;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 RESUMO DA CORREÇÃO:');
    console.log('='.repeat(80));
    console.log(`✅ Atualizados: ${atualizados}`);
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

corrigirNomes();

