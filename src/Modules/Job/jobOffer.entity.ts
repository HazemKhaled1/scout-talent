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
@Entity("jobOffer")
export class JobOffer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  offeredSalary: string;

  @Column({ type: "timestamp" })
  startDate: Date;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn({ type: "timestamp", default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @OneToOne(() => JobApplicant)
  @JoinColumn()
  application: JobApplicant;
}
