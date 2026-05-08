import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSubstituicoesIngredientesToReceitas1735000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'receitas',
      new TableColumn({
        name: 'substituicoes_ingredientes',
        type: 'jsonb',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('receitas', 'substituicoes_ingredientes');
  }
}


