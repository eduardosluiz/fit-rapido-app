import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class AddAtividadesAndAvaliacoes1737000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tabela de atividades
    await queryRunner.createTable(
      new Table({
        name: 'atividades',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'usuario_id',
            type: 'uuid',
          },
          {
            name: 'item_id',
            type: 'uuid',
          },
          {
            name: 'tipo',
            type: 'enum',
            enum: ['fiz_receita', 'treinei_hoje'],
          },
          {
            name: 'data',
            type: 'date',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Criar índice único para atividades
    await queryRunner.createIndex(
      'atividades',
      new TableIndex({
        name: 'IDX_ATIVIDADES_UNIQUE',
        columnNames: ['usuario_id', 'item_id', 'tipo', 'data'],
        isUnique: true,
      }),
    );

    // Criar foreign key para atividades
    await queryRunner.createForeignKey(
      'atividades',
      new TableForeignKey({
        columnNames: ['usuario_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Criar tabela de avaliações
    await queryRunner.createTable(
      new Table({
        name: 'avaliacoes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'usuario_id',
            type: 'uuid',
          },
          {
            name: 'item_id',
            type: 'uuid',
          },
          {
            name: 'tipo',
            type: 'enum',
            enum: ['receita', 'treino'],
          },
          {
            name: 'nota',
            type: 'int',
          },
          {
            name: 'comentario',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Criar índice único para avaliações
    await queryRunner.createIndex(
      'avaliacoes',
      new TableIndex({
        name: 'IDX_AVALIACOES_UNIQUE',
        columnNames: ['usuario_id', 'item_id', 'tipo'],
        isUnique: true,
      }),
    );

    // Criar foreign key para avaliações
    await queryRunner.createForeignKey(
      'avaliacoes',
      new TableForeignKey({
        columnNames: ['usuario_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('avaliacoes');
    await queryRunner.dropTable('atividades');
  }
}
