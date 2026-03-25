import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateRelation1774420410787 implements MigrationInterface {
    name = 'UpdateRelation1774420410787'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jobs" ADD "positions" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD "maxApplications" integer`);
        await queryRunner.query(`ALTER TABLE "job_applicant" DROP CONSTRAINT "FK_f04802c55e270cf2b9f70d6e42d"`);
        await queryRunner.query(`ALTER TABLE "job_applicant" DROP CONSTRAINT "UQ_f04802c55e270cf2b9f70d6e42d"`);
        await queryRunner.query(`ALTER TABLE "job_applicant" ADD CONSTRAINT "UQ_c2160c2da37f8325cd9c1b2b448" UNIQUE ("jobId", "applicantId")`);
        await queryRunner.query(`ALTER TABLE "job_applicant" ADD CONSTRAINT "FK_f04802c55e270cf2b9f70d6e42d" FOREIGN KEY ("cvId") REFERENCES "CV"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "job_applicant" DROP CONSTRAINT "FK_f04802c55e270cf2b9f70d6e42d"`);
        await queryRunner.query(`ALTER TABLE "job_applicant" DROP CONSTRAINT "UQ_c2160c2da37f8325cd9c1b2b448"`);
        await queryRunner.query(`ALTER TABLE "job_applicant" ADD CONSTRAINT "UQ_f04802c55e270cf2b9f70d6e42d" UNIQUE ("cvId")`);
        await queryRunner.query(`ALTER TABLE "job_applicant" ADD CONSTRAINT "FK_f04802c55e270cf2b9f70d6e42d" FOREIGN KEY ("cvId") REFERENCES "CV"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "maxApplications"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "positions"`);
    }

}
