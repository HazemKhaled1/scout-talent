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
import { HiredDetails } from "./Hired_Details.entity";
import { Interview } from "./interviews.entity";
import { JobOffer } from "./jobOffer.entity";
import { Reject } from "./reject.entity";


@Module({
    imports:[
        forwardRef(()=>UserModule),
        JwtModule,
        CVModule,
        TypeOrmModule.forFeature([ Job, JobApplicant, HiredDetails ,Interview ,JobOffer ,Reject])
    ],
    controllers:[JobController,CandidateController],
    providers:[JobServices],
    exports:[JobServices]
})
export class JobModule{}