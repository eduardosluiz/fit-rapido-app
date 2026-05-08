import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddImagensUrlToReceitas1734567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'receitas',
      new TableColumn({
        name: 'imagens_url',
        type: 'text[]',
        isNullable: true,
        default: "'{}'",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('receitas', 'imagens_url');
  }
}

