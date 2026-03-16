import { forwardRef, Module } from "@nestjs/common";
import { JobServices } from "./job.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Job } from "./job.entity";
import { JobApplicant } from "./job_applicant.entity";
import { JobController } from "./job.controller";
import { UserModule } from "../Users/user.module";
import { JwtModule } from "@nestjs/jwt";
import { CVModule } from "../CV/cv.module";
import { CandidateController } from "./candidate.controller";


@Module({
    imports:[
        forwardRef(()=>UserModule),
        JwtModule,
        CVModule,
        TypeOrmModule.forFeature([ Job, JobApplicant])
    ],
    controllers:[JobController,CandidateController],
    providers:[JobServices],
    exports:[JobServices]
})
export class JobModule{}