import { Column, Entity, PrimaryGeneratedColumn ,CreateDateColumn,ManyToOne } from "typeorm";
import { CURRENT_TIMESTAMP } from "src/utils/Constant/constant";
import { User } from "../Users/user.entity";

@Entity({name:'skills'})
export class SkillOrSpecializations{

    @PrimaryGeneratedColumn()
    id:number

    @Column()
    name:string

    @CreateDateColumn({type:'timestamp' , default:()=>CURRENT_TIMESTAMP})
    createdAt:Date

    @ManyToOne(()=>User,(user)=>user.skillsORspecializations)
    userORcompany:User
}