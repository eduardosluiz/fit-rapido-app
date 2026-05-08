const { DataSource } = require('typeorm');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const AddSubstituicoesIngredientesToReceitas = require('../dist/migrations/1735000000000-AddSubstituicoesIngredientesToReceitas').AddSubstituicoesIngredientesToReceitas1735000000000;

async function executarMigration() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Conectado ao banco de dados');

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const migration = new AddSubstituicoesIngredientesToReceitas();
      await migration.up(queryRunner);
      await queryRunner.commitTransaction();
      console.log('✅ Migration executada com sucesso!');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error.message);
    if (error.code === '42703') {
      console.log('ℹ️  A coluna pode já existir. Verificando...');
      // Tentar verificar se a coluna já existe
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      const result = await queryRunner.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'receitas' 
        AND column_name = 'substituicoes_ingredientes'
      `);
      if (result.length > 0) {
        console.log('✅ A coluna já existe no banco de dados');
      } else {
        console.log('❌ A coluna não existe. Erro:', error.message);
      }
      await queryRunner.release();
    }
    process.exit(1);
  }
}

executarMigration();


