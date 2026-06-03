const fs = require('fs');
const path = require('path');

const EXTRATOS_DIR = 'C:\\Users\\User\\extratos';

// Dictionary to hold total received by person/entity
const receivedTotals = {};

function extractName(description) {
  if (!description.includes('Transferência recebida pelo Pix') && !description.includes('Transferência Recebida')) {
    return null;
  }
  
  const parts = description.split(' - ');
  if (parts.length >= 2) {
    let name = parts[1].trim();
    // Clean up things like "52134575 " at the beginning (if it's an ID)
    name = name.replace(/^\d+\s+/, '');
    // Clean up things like " 03032642094" at the end (CPF suffix)
    name = name.replace(/\s+\d+$/, '');
    
    // Title case
    return name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
  return null;
}

try {
  const files = fs.readdirSync(EXTRATOS_DIR);
  
  for (const file of files) {
    if (file.endsWith('.csv')) {
      const filepath = path.join(EXTRATOS_DIR, file);
      const content = fs.readFileSync(filepath, 'utf-8');
      
      const lines = content.split('\n');
      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Parse CSV line (simple split by comma since Nubank uses commas and no quotes usually, but we should be careful)
        // A simple split by comma works for basic Nubank CSV as long as there are no commas in description
        // Let's use a better regex split just in case:
        const columns = line.split(',');
        if (columns.length < 4) continue;
        
        const valorStr = columns[1];
        const valor = parseFloat(valorStr);
        if (isNaN(valor)) continue;
        
        if (valor > 0) {
          // Rejoin description in case it had commas
          const desc = columns.slice(3).join(',');
          const name = extractName(desc);
          const dataTx = columns[0];
          
          if (name) {
            // Filter out own transfers for Income Tax
            if (name.toLowerCase() === 'eduardo da silva luiz') {
                continue;
            }
            if (!receivedTotals[name]) {
              receivedTotals[name] = { total: 0, extratos: [] };
            }
            receivedTotals[name].total += valor;
            receivedTotals[name].extratos.push(`${dataTx}: R$ ${valor.toFixed(2)}`);
          }
        }
      }
    }
  }
  
  const sorted = Object.entries(receivedTotals).sort((a, b) => b[1].total - a[1].total);
  
  console.log('Relatório Detalhado de Recebimentos por Pessoa/Empresa');
  console.log('============================================');
  let totalGeral = 0;
  for (const [name, data] of sorted) {
    console.log(`\n${name}: R$ ${data.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    // Print up to 5 transactions as proof
    const limit = Math.min(5, data.extratos.length);
    for(let i=0; i<limit; i++) {
        console.log(`   -> ${data.extratos[i]}`);
    }
    if (data.extratos.length > 5) {
        console.log(`   -> ... e mais ${data.extratos.length - 5} transações`);
    }
    totalGeral += data.total;
  }
  console.log('============================================');
  console.log(`TOTAL GERAL RECEBIDO: R$ ${totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  
} catch (err) {
  console.error('Error:', err);
}
