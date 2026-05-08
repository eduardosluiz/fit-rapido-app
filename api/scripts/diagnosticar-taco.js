const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Pegar caminho do arquivo do argumento
const caminhoArquivo = process.argv[2];

if (!caminhoArquivo) {
  console.error('❌ Uso: node diagnosticar-taco.js <caminho-do-arquivo.xlsx>');
  process.exit(1);
}

if (!fs.existsSync(caminhoArquivo)) {
  console.error(`❌ Arquivo não encontrado: ${caminhoArquivo}`);
  process.exit(1);
}

console.log(`📖 Lendo arquivo: ${caminhoArquivo}`);
const workbook = XLSX.readFile(caminhoArquivo);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

console.log(`\n📊 Total de linhas: ${data.length}`);
console.log(`📋 Planilha: ${sheetName}\n`);

// Analisar primeiras 10 linhas
console.log('='.repeat(80));
console.log('PRIMEIRAS 10 LINHAS DO ARQUIVO:');
console.log('='.repeat(80));

for (let i = 0; i < Math.min(10, data.length); i++) {
  const row = data[i];
  console.log(`\n🔹 Linha ${i + 1}:`);
  row.forEach((cell, idx) => {
    if (cell && String(cell).trim() !== '') {
      console.log(`   [${idx}] "${String(cell).substring(0, 50)}"`);
    }
  });
}

// Encontrar linha de header
console.log('\n' + '='.repeat(80));
console.log('ANÁLISE DE HEADERS:');
console.log('='.repeat(80));

let melhorHeaderRow = 0;
let maiorContagem = 0;

for (let i = 0; i < Math.min(10, data.length); i++) {
  const row = data[i];
  const preenchidos = row.filter(c => c && String(c).trim() !== '').length;
  console.log(`Linha ${i + 1}: ${preenchidos} colunas preenchidas`);
  
  if (preenchidos > maiorContagem) {
    maiorContagem = preenchidos;
    melhorHeaderRow = i;
  }
}

console.log(`\n✅ Melhor linha de header: ${melhorHeaderRow + 1} (${maiorContagem} colunas)`);

const headers = data[melhorHeaderRow];
console.log('\n📋 COLUNAS ENCONTRADAS:');
headers.forEach((h, idx) => {
  if (h && String(h).trim() !== '') {
    console.log(`   [${idx}] "${h}"`);
  }
});

// Buscar colunas específicas
console.log('\n' + '='.repeat(80));
console.log('BUSCA POR COLUNAS ESPECÍFICAS:');
console.log('='.repeat(80));

const buscarColuna = (termo) => {
  return headers.findIndex((h, idx) => {
    if (!h) return false;
    const hLower = String(h).toLowerCase();
    const termoLower = termo.toLowerCase();
    return hLower.includes(termoLower) || termoLower.includes(hLower);
  });
};

const termos = [
  'nome', 'alimento', 'descrição', 'descricao', 'desc',
  'energia', 'caloria', 'kcal',
  'proteína', 'proteina', 'prot',
  'carboidrato', 'carbo', 'carb',
  'lipídeo', 'lipideo', 'gordura', 'lip',
  'fibra', 'fiber',
  'sódio', 'sodio', 'sodium'
];

termos.forEach(termo => {
  const idx = buscarColuna(termo);
  if (idx !== -1) {
    console.log(`✅ "${termo}": coluna [${idx}] "${headers[idx]}"`);
  }
});

// Mostrar exemplo de dados
console.log('\n' + '='.repeat(80));
console.log('EXEMPLO DE DADOS (primeira linha de dados):');
console.log('='.repeat(80));

if (data.length > melhorHeaderRow + 1) {
  const primeiraLinhaDados = data[melhorHeaderRow + 1];
  headers.forEach((h, idx) => {
    if (h && String(h).trim() !== '') {
      const valor = primeiraLinhaDados[idx];
      console.log(`   "${h}": ${valor !== null && valor !== undefined ? `"${valor}"` : '(vazio)'}`);
    }
  });
}

console.log('\n' + '='.repeat(80));
console.log('✅ Diagnóstico completo!');
console.log('='.repeat(80));

