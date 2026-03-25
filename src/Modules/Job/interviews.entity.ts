import { CURRENT_TIMESTAMP } from "src/Shared/constants/variables";
import {
  InterviewStatus,
  InterviewTypes,
} from "src/Shared/Enums/Interview.enum";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { JobApplicant } from "./job_applicant.entity";
import { FeedBack } from "./feedback.entity";
import { CancelInterview } from "./cancelInterview.entity";

@Entity("interviews")
export class Interview {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: InterviewTypes,
    default: InterviewTypes.TECHNICAL,
  })
  type: InterviewTypes;

  @Column({
    type: "enum",
    enum: InterviewStatus,
    default: InterviewStatus.SCHEDULED,
  })
  status: InterviewStatus;

  @Column({ type: "timestamp" })
  scheduledAt: Date;

  @Column()
  meetingLink: string;

  @CreateDateColumn({ type: "timestamp", default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @ManyToOne(() => JobApplicant, (application) => application.interviews)
  application: JobApplicant;

  @OneToOne(() => FeedBack, (feedback) => feedback.interview)
  feedback: FeedBack;

  @OneToOne(() => CancelInterview, (cancel) => cancel.interview)
  CancelInterview: CancelInterview;
}
