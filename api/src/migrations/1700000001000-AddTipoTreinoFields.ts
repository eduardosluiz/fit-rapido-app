import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTipoTreinoFields1700000001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar tipo_treino
    await queryRunner.addColumn(
      'treinos',
      new TableColumn({
        name: 'tipo_treino',
        type: 'varchar',
        isNullable: true,
        default: null,
      }),
    );

    // Adicionar tipo_dica
    await queryRunner.addColumn(
      'treinos',
      new TableColumn({
        name: 'tipo_dica',
        type: 'varchar',
        isNullable: true,
      }),
    );

    // Adicionar tipo_equipamento_casa
    await queryRunner.addColumn(
      'treinos',
      new TableColumn({
        name: 'tipo_equipamento_casa',
        type: 'varchar',
        isNullable: true,
      }),
    );

    // Adicionar substituicoes_exercicios
    await queryRunner.addColumn(
      'treinos',
      new TableColumn({
        name: 'substituicoes_exercicios',
        type: 'jsonb',
        isNullable: true,
      }),
    );

    // Adicionar mostrar_ponto_partida
    await queryRunner.addColumn(
      'treinos',
      new TableColumn({
        name: 'mostrar_ponto_partida',
        type: 'boolean',
        default: false,
      }),
    );

    // Criar índices para melhorar performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_treinos_tipo_treino" ON "treinos" ("tipo_treino");
      CREATE INDEX IF NOT EXISTS "IDX_treinos_tipo_dica" ON "treinos" ("tipo_dica");
      CREATE INDEX IF NOT EXISTS "IDX_treinos_mostrar_ponto_partida" ON "treinos" ("mostrar_ponto_partida");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_treinos_mostrar_ponto_partida";
      DROP INDEX IF EXISTS "IDX_treinos_tipo_dica";
      DROP INDEX IF EXISTS "IDX_treinos_tipo_treino";
    `);

    // Remover colunas
    await queryRunner.dropColumn('treinos', 'mostrar_ponto_partida');
    await queryRunner.dropColumn('treinos', 'substituicoes_exercicios');
    await queryRunner.dropColumn('treinos', 'tipo_equipamento_casa');
    await queryRunner.dropColumn('treinos', 'tipo_dica');
    await queryRunner.dropColumn('treinos', 'tipo_treino');
  }
}
