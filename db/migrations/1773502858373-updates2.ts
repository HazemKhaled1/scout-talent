import { MigrationInterface, QueryRunner } from "typeorm";

export class Updates21773502858373 implements MigrationInterface {
    name = 'Updates21773502858373'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "job_applicant" DROP CONSTRAINT "PK_66f870f5e5792506f5901a02e45"`);
        await queryRunner.query(`ALTER TABLE "job_applicant" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "job_applicant" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "job_applicant" ADD CONSTRAINT "PK_66f870f5e5792506f5901a02e45" PRIMARY KEY ("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "job_applicant" DROP CONSTRAINT "PK_66f870f5e5792506f5901a02e45"`);
        await queryRunner.query(`ALTER TABLE "job_applicant" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "job_applicant" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "job_applicant" ADD CONSTRAINT "PK_66f870f5e5792506f5901a02e45" PRIMARY KEY ("id")`);
    }

}
