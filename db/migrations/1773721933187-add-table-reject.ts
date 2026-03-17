import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTableReject1773721933187 implements MigrationInterface {
    name = 'AddTableReject1773721933187'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reject-cv" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reason" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "applicationId" uuid, CONSTRAINT "REL_1e2c1e8293dcdaca3719dbb94a" UNIQUE ("applicationId"), CONSTRAINT "PK_445fa50d3594efddb8f8ee47d36" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "reject-cv" ADD CONSTRAINT "FK_1e2c1e8293dcdaca3719dbb94a2" FOREIGN KEY ("applicationId") REFERENCES "job_applicant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reject-cv" DROP CONSTRAINT "FK_1e2c1e8293dcdaca3719dbb94a2"`);
        await queryRunner.query(`DROP TABLE "reject-cv"`);
    }

}
