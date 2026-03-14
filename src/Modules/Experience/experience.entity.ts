import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { CURRENT_TIMESTAMP } from "src/Shared/constants/variables";
import { User } from "../Users/user.entity";
@Entity({ name: "experience" })
export class Experience {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column()
  company: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  description: string;

  @CreateDateColumn({ type: "timestamp", default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @CreateDateColumn({
    type: "timestamp",
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.experience)
  user: User;
}
