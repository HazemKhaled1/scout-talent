import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from "typeorm";
import { Job } from "./job.entity";
import { User } from "../Users/user.entity";
import { CURRENT_TIMESTAMP } from "src/Shared/constants/variables";
import { CandidateStatus } from "src/Shared/Enums/candidateStatus.enum";
import { CV } from "../CV/cv.entity";

@Entity({ name: "job_applicant" })
export class JobApplicant {
  @PrimaryGeneratedColumn('uuid')
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

  @Column({ type: "timestamp", nullable: true, default: null })
  hiredAt: Date;
}
