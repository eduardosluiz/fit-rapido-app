const path = require('path');

// Mudar para o diretório api para ter acesso aos módulos
process.chdir(path.join(__dirname, '../api'));

// Agora fazer o require após mudar o diretório
const { Client } = require('pg');
require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

async function executarMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log(`${colors.green}✅ Conectado ao banco de dados${colors.reset}\n`);

    // Verificar se as tabelas já existem
    const checkReceitas = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'receitas_categorias'
      );
    `);
    
    const checkTreinos = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'treinos_categorias'
      );
    `);

    if (checkReceitas.rows[0].exists && checkTreinos.rows[0].exists) {
      console.log(`${colors.yellow}⚠️  As tabelas de junção já existem!${colors.reset}`);
      return;
    }

    console.log(`${colors.cyan}🔄 Criando tabelas de junção...${colors.reset}`);

    // Criar tabela receitas_categorias
    if (!checkReceitas.rows[0].exists) {
      await client.query(`
        CREATE TABLE IF NOT EXISTS receitas_categorias (
          receita_id UUID NOT NULL,
          categoria_id UUID NOT NULL,
          PRIMARY KEY (receita_id, categoria_id),
          CONSTRAINT fk_receita FOREIGN KEY (receita_id) REFERENCES receitas(id) ON DELETE CASCADE,
          CONSTRAINT fk_categoria_receita FOREIGN KEY (categoria_id) REFERENCES categorias_receitas(id) ON DELETE CASCADE
        );
      `);
      console.log(`${colors.green}✅ Tabela receitas_categorias criada${colors.reset}`);

      // Migrar dados existentes
      await client.query(`
        INSERT INTO receitas_categorias (receita_id, categoria_id)
        SELECT id, categoria_id
        FROM receitas
        WHERE categoria_id IS NOT NULL
        ON CONFLICT DO NOTHING;
      `);
      console.log(`${colors.green}✅ Dados migrados para receitas_categorias${colors.reset}`);
    }

    // Criar tabela treinos_categorias
    if (!checkTreinos.rows[0].exists) {
      await client.query(`
        CREATE TABLE IF NOT EXISTS treinos_categorias (
          treino_id UUID NOT NULL,
          categoria_id UUID NOT NULL,
          PRIMARY KEY (treino_id, categoria_id),
          CONSTRAINT fk_treino FOREIGN KEY (treino_id) REFERENCES treinos(id) ON DELETE CASCADE,
          CONSTRAINT fk_categoria_treino FOREIGN KEY (categoria_id) REFERENCES categorias_treinos(id) ON DELETE CASCADE
        );
      `);
      console.log(`${colors.green}✅ Tabela treinos_categorias criada${colors.reset}`);

      // Migrar dados existentes
      await client.query(`
        INSERT INTO treinos_categorias (treino_id, categoria_id)
        SELECT id, categoria_id
        FROM treinos
        WHERE categoria_id IS NOT NULL
        ON CONFLICT DO NOTHING;
      `);
      console.log(`${colors.green}✅ Dados migrados para treinos_categorias${colors.reset}`);
    }

    console.log(`\n${colors.green}✅ Migration executada com sucesso!${colors.reset}\n`);

  } catch (error) {
    console.error(`${colors.red}❌ Erro ao executar migration:${colors.reset}`, error.message);
    throw error;
  } finally {
    await client.end();
  }
}

executarMigration().catch(console.error);
