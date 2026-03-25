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
import { FeedBack } from "./feedback.entity";
import { CancelInterview } from "./cancelInterview.entity";
import { InterviewController } from "./interview.controller";
import { InterviewService } from "./interview.service";

@Module({
  imports: [
    forwardRef(() => UserModule),
    JwtModule,
    CVModule,
    TypeOrmModule.forFeature([
      Job,
      JobApplicant,
      HiredDetails,
      Interview,
      JobOffer,
      Reject,
      FeedBack,
      CancelInterview,
    ]),
  ],
  controllers: [JobController, CandidateController, InterviewController],
  providers: [JobServices, InterviewService],
  exports: [JobServices],
})
export class JobModule {}
