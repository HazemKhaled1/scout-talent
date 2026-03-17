import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Job } from "./job.entity";
import { User } from "../Users/user.entity";
import { CURRENT_TIMESTAMP } from "src/Shared/constants/variables";
import { CandidateStatus } from "src/Shared/Enums/candidateStatus.enum";
import { CV } from "../CV/cv.entity";
import { JobOffer } from "./jobOffer.entity";
import { HiredDetails } from "./Hired_Details.entity";
import { Interview } from "./interviews.entity";
import { Reject } from "./reject.entity";

@Entity({ name: "job_applicant" })
export class JobApplicant {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: CandidateStatus, default: CandidateStatus.NEW })
  status: CandidateStatus;

  @Column()
  about: string;

  @ManyToOne(() => Job, (job) => job.applicants, { eager: true })
  job: Job;

  @ManyToOne(() => User, (user) => user.jobApplicant, { eager: true })
  applicant: User;

  @OneToOne(() => CV, { eager: true })
  @JoinColumn()
  cv: CV;

  @CreateDateColumn({ type: "timestamp", default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @OneToOne(() => HiredDetails, (details) => details.application, {
    eager: true,
  })
  hiredDetails: HiredDetails;

  @Column({ type: "timestamp", nullable: true, default: null })
  hiredAt: Date;

  @Column({ type: "timestamp", nullable: true, default: null })
  screenAt: Date;

  @OneToOne(() => JobOffer, (offer) => offer.application, { eager: true })
  offer: JobOffer;

  @Column({ type: "timestamp", nullable: true, default: null })
  sendOfferAt: Date;

  @OneToMany(() => Interview, (interview) => interview.application, {
    eager: true,
  })
  interviews: Interview[];

  @Column({ type: "timestamp", nullable: true, default: null })
  interviewAt: Date;

  @OneToOne(() => Reject, (reject) => reject.application, {
    eager: true,
  })
  reject: Reject;

  @Column({ type: "timestamp", nullable: true, default: null })
  rejectAt: Date;
}
