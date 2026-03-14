import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { CURRENT_TIMESTAMP } from "src/Shared/constants/variables";
import { User } from "../Users/user.entity";

@Entity({ name: "CV" })
export class CV {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  url: string;

  @CreateDateColumn({ type: "timestamp", default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.Cvs)
  applicant: User;
}
