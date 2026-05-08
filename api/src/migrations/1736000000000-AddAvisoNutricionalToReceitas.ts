import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAvisoNutricionalToReceitas1736000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'receitas',
      new TableColumn({
        name: 'aviso_nutricional',
        type: 'text',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('receitas', 'aviso_nutricional');
  }
}
