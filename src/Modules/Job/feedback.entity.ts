import { CURRENT_TIMESTAMP } from "src/Shared/constants/variables";
import {
    Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Interview } from "./interviews.entity";
import { InterviewNextStep } from "src/Shared/Enums/Interview.enum";

@Entity("feedback")
@Check(`"rating" >= 1 AND "rating" <= 5`)
export class FeedBack {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  publicFeedback: string;

  @Column()
  rating: number;

  @Column({
    type: "enum",
    enum: InterviewNextStep,
  })
  nextStep: InterviewNextStep;

  @CreateDateColumn({ type: "timestamp", default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @OneToOne(() => Interview)
  @JoinColumn()
  interview: Interview;
}
