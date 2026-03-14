import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates31773510416607 implements MigrationInterface {
    name = 'Updates31773510416607'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "CV" DROP COLUMN "fileUrl"`);
        await queryRunner.query(`ALTER TABLE "CV" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "CV" ADD "url" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "CV" DROP COLUMN "url"`);
        await queryRunner.query(`ALTER TABLE "CV" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "CV" ADD "fileUrl" character varying NOT NULL`);
    }

}
