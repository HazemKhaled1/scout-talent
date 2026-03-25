import { MigrationInterface, QueryRunner } from "typeorm";

export class Add2Tables1774351454871 implements MigrationInterface {
    name = 'Add2Tables1774351454871'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."feedback_nextstep_enum" AS ENUM('Offered', 'rejected', 'Another Interview', 'Hold')`);
        await queryRunner.query(`CREATE TABLE "feedback" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "publicFeedback" character varying NOT NULL, "rating" integer NOT NULL, "nextStep" "public"."feedback_nextstep_enum" NOT NULL DEFAULT 'Hold', "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "interviewId" uuid, CONSTRAINT "REL_1da270251d13dd20cf2a50271f" UNIQUE ("interviewId"), CONSTRAINT "CHK_55e3f752b77d6db7979d831c37" CHECK ("rating" >= 1 AND "rating" <= 5), CONSTRAINT "PK_8389f9e087a57689cd5be8b2b13" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."cancel-interview_cancelby_enum" AS ENUM('Applicant', 'Company')`);
        await queryRunner.query(`CREATE TABLE "cancel-interview" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reason" character varying, "cancelBy" "public"."cancel-interview_cancelby_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "interviewId" uuid, CONSTRAINT "REL_0888955f5632638166d1edad51" UNIQUE ("interviewId"), CONSTRAINT "PK_d876e20fe7347355457f08f2839" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."interviews_status_enum" AS ENUM('Scheduled', 'Completed', 'Cancelled', 'Rescheduled')`);
        await queryRunner.query(`ALTER TABLE "interviews" ADD "status" "public"."interviews_status_enum" NOT NULL DEFAULT 'Scheduled'`);
        await queryRunner.query(`ALTER TABLE "feedback" ADD CONSTRAINT "FK_1da270251d13dd20cf2a50271f1" FOREIGN KEY ("interviewId") REFERENCES "interviews"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cancel-interview" ADD CONSTRAINT "FK_0888955f5632638166d1edad512" FOREIGN KEY ("interviewId") REFERENCES "interviews"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cancel-interview" DROP CONSTRAINT "FK_0888955f5632638166d1edad512"`);
        await queryRunner.query(`ALTER TABLE "feedback" DROP CONSTRAINT "FK_1da270251d13dd20cf2a50271f1"`);
        await queryRunner.query(`ALTER TABLE "interviews" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."interviews_status_enum"`);
        await queryRunner.query(`DROP TABLE "cancel-interview"`);
        await queryRunner.query(`DROP TYPE "public"."cancel-interview_cancelby_enum"`);
        await queryRunner.query(`DROP TABLE "feedback"`);
        await queryRunner.query(`DROP TYPE "public"."feedback_nextstep_enum"`);
    }

}
