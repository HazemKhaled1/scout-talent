import { forwardRef, Module } from "@nestjs/common";
import { JobServices } from "./job.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Job } from "./job.entity";
import { JobApplicant } from "./job_applicant.entity";
import { JobController } from "./job.controller";
import { UserModule } from "../Users/user.module";
import { JwtModule } from "@nestjs/jwt";
import { CVModule } from "../CV/cv.module";


@Module({
    controllers:[JobController],
    providers:[JobServices],
    imports:[
        forwardRef(()=>UserModule),
        JwtModule,
        CVModule,
        TypeOrmModule.forFeature([ Job, JobApplicant])
    ],
    exports:[JobServices]
})
export class JobModule{}