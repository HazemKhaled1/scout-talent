import { CURRENT_TIMESTAMP } from "src/Shared/constants/variables";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { JobApplicant } from "./job_applicant.entity";

@Entity("reject-cv")
export class Reject {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  reason: string;

  @CreateDateColumn({ type: "timestamp", default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @OneToOne(() => JobApplicant)
  @JoinColumn()
  application: JobApplicant;
}
