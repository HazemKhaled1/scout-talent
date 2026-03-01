"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Initial1772291801430 = void 0;
class Initial1772291801430 {
    name = 'Initial1772291801430';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "CV" ("id" SERIAL NOT NULL, "fileUrl" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "applicantId" integer, CONSTRAINT "PK_a7e0c0895ceb856a1420ce991fc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."job_applicant_status_enum" AS ENUM('New', 'Screening', 'interview', 'Offered', 'Hired', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "job_applicant" ("id" SERIAL NOT NULL, "status" "public"."job_applicant_status_enum" NOT NULL DEFAULT 'New', "about" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "hiredAt" TIMESTAMP, "jobId" integer, "applicantId" integer, "cvId" integer, CONSTRAINT "REL_f04802c55e270cf2b9f70d6e42" UNIQUE ("cvId"), CONSTRAINT "PK_66f870f5e5792506f5901a02e45" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."jobs_type_enum" AS ENUM('Full_Time', 'Part_Time', 'Contract', 'Freelance', 'Internship', 'Temporary')`);
        await queryRunner.query(`CREATE TYPE "public"."jobs_status_enum" AS ENUM('Draft', 'Published', 'Closed', 'Paused', 'Expired', 'Filled')`);
        await queryRunner.query(`CREATE TYPE "public"."jobs_workmode_enum" AS ENUM('Onsite', 'Remote', 'Hybrid')`);
        await queryRunner.query(`CREATE TABLE "jobs" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "location" character varying NOT NULL, "minSalary" numeric(10,2), "maxSalary" numeric(10,2), "type" "public"."jobs_type_enum" NOT NULL, "status" "public"."jobs_status_enum" NOT NULL DEFAULT 'Draft', "workMode" "public"."jobs_workmode_enum" NOT NULL, "description" text NOT NULL, "skills" text, "responsibilities" text, "requirements" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "companyId" integer, CONSTRAINT "PK_cf0a6c42b72fcc7f7c237def345" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "skills" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "userORcompanyId" integer, CONSTRAINT "PK_0d3212120f4ecedf90864d7e298" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "experience" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "company" character varying NOT NULL, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "description" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "userId" integer, CONSTRAINT "PK_5e8d5a534100e1b17ee2efa429a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('Applicant', 'Company')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "phone" character varying NOT NULL, "job_title" character varying NOT NULL, "location" character varying NOT NULL, "linkedIn_profile" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'Applicant', "About" character varying, "refreshToken" character varying, "isAccountVerified" boolean NOT NULL DEFAULT false, "verificationToken" character varying, "resetPasswordToken" character varying, "createAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "CV" ADD CONSTRAINT "FK_0a4835f22b6d5b52b1ba4ba59d2" FOREIGN KEY ("applicantId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_applicant" ADD CONSTRAINT "FK_f4887ecc2367922eb6feac0f1cd" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_applicant" ADD CONSTRAINT "FK_c78f9fee4defea0110ba5ef0ed0" FOREIGN KEY ("applicantId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_applicant" ADD CONSTRAINT "FK_f04802c55e270cf2b9f70d6e42d" FOREIGN KEY ("cvId") REFERENCES "CV"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD CONSTRAINT "FK_6ce4483dc65ed9d2e171269d801" FOREIGN KEY ("companyId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "skills" ADD CONSTRAINT "FK_ba4845b5f720bc463a8d673a120" FOREIGN KEY ("userORcompanyId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "experience" ADD CONSTRAINT "FK_cbfb1d1219454c9b45f1b3c4274" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "experience" DROP CONSTRAINT "FK_cbfb1d1219454c9b45f1b3c4274"`);
        await queryRunner.query(`ALTER TABLE "skills" DROP CONSTRAINT "FK_ba4845b5f720bc463a8d673a120"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_6ce4483dc65ed9d2e171269d801"`);
        await queryRunner.query(`ALTER TABLE "job_applicant" DROP CONSTRAINT "FK_f04802c55e270cf2b9f70d6e42d"`);
        await queryRunner.query(`ALTER TABLE "job_applicant" DROP CONSTRAINT "FK_c78f9fee4defea0110ba5ef0ed0"`);
        await queryRunner.query(`ALTER TABLE "job_applicant" DROP CONSTRAINT "FK_f4887ecc2367922eb6feac0f1cd"`);
        await queryRunner.query(`ALTER TABLE "CV" DROP CONSTRAINT "FK_0a4835f22b6d5b52b1ba4ba59d2"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "experience"`);
        await queryRunner.query(`DROP TABLE "skills"`);
        await queryRunner.query(`DROP TABLE "jobs"`);
        await queryRunner.query(`DROP TYPE "public"."jobs_workmode_enum"`);
        await queryRunner.query(`DROP TYPE "public"."jobs_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."jobs_type_enum"`);
        await queryRunner.query(`DROP TABLE "job_applicant"`);
        await queryRunner.query(`DROP TYPE "public"."job_applicant_status_enum"`);
        await queryRunner.query(`DROP TABLE "CV"`);
    }
}
exports.Initial1772291801430 = Initial1772291801430;
//# sourceMappingURL=1772291801430-initial.js.map