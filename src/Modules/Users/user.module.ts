import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { MailModule } from "src/Shared/Mail/mail.module";
import { JobApplicant } from "../Job/job_applicant.entity";
import { JwtModule } from "@nestjs/jwt";
import { CompanyController } from "./company.controller";
import { JobModule } from "../Job/job.module";
@Module({
  controllers: [UserController, CompanyController],
  providers: [UserService],
  imports: [
    MailModule,
    TypeOrmModule.forFeature([User, JobApplicant]),
    JwtModule,
    forwardRef(() => JobModule),
  ],
  exports: [UserService],
})
export class UserModule {}
