import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class ChangeCategoriasToManyToMany1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tabela de junção para receitas_categorias
    await queryRunner.createTable(
      new Table({
        name: 'receitas_categorias',
        columns: [
          {
            name: 'receita_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'categoria_id',
            type: 'uuid',
            isPrimary: true,
          },
        ],
      }),
      true,
    );

    // Criar tabela de junção para treinos_categorias
    await queryRunner.createTable(
      new Table({
        name: 'treinos_categorias',
        columns: [
          {
            name: 'treino_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'categoria_id',
            type: 'uuid',
            isPrimary: true,
          },
        ],
      }),
      true,
    );

    // Migrar dados existentes de receitas
    // Copiar categoria_id para a tabela de junção
    await queryRunner.query(`
      INSERT INTO receitas_categorias (receita_id, categoria_id)
      SELECT id, categoria_id
      FROM receitas
      WHERE categoria_id IS NOT NULL
    `);

    // Migrar dados existentes de treinos
    // Copiar categoria_id para a tabela de junção
    await queryRunner.query(`
      INSERT INTO treinos_categorias (treino_id, categoria_id)
      SELECT id, categoria_id
      FROM treinos
      WHERE categoria_id IS NOT NULL
    `);

    // Adicionar foreign keys para receitas_categorias
    await queryRunner.createForeignKey(
      'receitas_categorias',
      new TableForeignKey({
        columnNames: ['receita_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'receitas',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'receitas_categorias',
      new TableForeignKey({
        columnNames: ['categoria_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'categorias_receitas',
        onDelete: 'CASCADE',
      }),
    );

    // Adicionar foreign keys para treinos_categorias
    await queryRunner.createForeignKey(
      'treinos_categorias',
      new TableForeignKey({
        columnNames: ['treino_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'treinos',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'treinos_categorias',
      new TableForeignKey({
        columnNames: ['categoria_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'categorias_treinos',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover foreign keys
    const receitasTable = await queryRunner.getTable('receitas_categorias');
    const treinosTable = await queryRunner.getTable('treinos_categorias');

    if (receitasTable) {
      const foreignKeys = receitasTable.foreignKeys;
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('receitas_categorias', fk);
      }
    }

    if (treinosTable) {
      const foreignKeys = treinosTable.foreignKeys;
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('treinos_categorias', fk);
      }
    }

    // Remover tabelas de junção
    await queryRunner.dropTable('receitas_categorias');
    await queryRunner.dropTable('treinos_categorias');
  }
}
