/**
 * Script para executar migration do campo informacoes_nutricionais
 * 
 * Uso: node scripts/executar-migration-informacoes-nutricionais.js
 */

const { Client } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

async function executarMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}  🔄 Executando Migration${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

    await client.connect();
    console.log(`${colors.green}✅ Conectado ao banco de dados${colors.reset}\n`);

    // Ler arquivo de migration
    const migrationPath = path.join(__dirname, '../migrations/003_add_informacoes_nutricionais.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log(`${colors.cyan}📝 Executando SQL...${colors.reset}`);
    console.log(`${colors.yellow}${migrationSQL}${colors.reset}\n`);

    // Executar migration
    await client.query(migrationSQL);

    console.log(`${colors.green}✅ Migration executada com sucesso!${colors.reset}\n`);

    // Verificar se a coluna foi criada
    const checkQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'receitas' 
      AND column_name = 'informacoes_nutricionais';
    `;

    const result = await client.query(checkQuery);
    
    if (result.rows.length > 0) {
      console.log(`${colors.green}✅ Coluna verificada:${colors.reset}`);
      console.log(`   Nome: ${result.rows[0].column_name}`);
      console.log(`   Tipo: ${result.rows[0].data_type}`);
      console.log(`   Nullable: ${result.rows[0].is_nullable}\n`);
    } else {
      console.log(`${colors.yellow}⚠️  Coluna não encontrada após migration${colors.reset}\n`);
    }

  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`${colors.yellow}⚠️  Coluna já existe no banco de dados${colors.reset}`);
      console.log(`${colors.green}✅ Nada a fazer - migration já foi aplicada${colors.reset}\n`);
    } else {
      console.error(`${colors.red}❌ Erro ao executar migration:${colors.reset}`);
      console.error(`${colors.red}${error.message}${colors.reset}\n`);
      process.exit(1);
    }
  } finally {
    await client.end();
    console.log(`${colors.cyan}🔌 Conexão encerrada${colors.reset}\n`);
  }
}

executarMigration();

