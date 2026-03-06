import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { MoreThan, Repository } from "typeorm";
import { JobApplicant } from "../Job/job_applicant.entity";
import { CandidateStatus } from "src/utils/Enums/candidateStatus.enum";
import { updateUserDTO } from "./dto/updateUser.dto";
import { updateoraddAboutDTO } from "./dto/update&addAbout.dto";
@Injectable()
export class UserService{

    constructor(
        @InjectRepository(User) private userRepository : Repository<User>,
        @InjectRepository(JobApplicant) private jobApplicantRepository : Repository<JobApplicant>
    ){}

    public async findUser(id:number){

        const user= await this.userRepository.findOne({ where :{ id } })

        return user
    }

    public async basicInformation(id:number){
        
        const user= await this.userRepository.findOne({ 
            where :{ id } ,
            select : ["id","name","email" ,"phone" , "linkedIn_profile" , "job_title" ,"location" , 'About']
        })
        
        return user
    }

    public async updateProfile(dto:updateUserDTO , id:number){

        const user= await this.userRepository.findOne({ where :{ id } })

        if(!user) throw new BadRequestException('no user found')

        await this.userRepository.update(id,dto)

        return true
    }

    public async addorupdateAbout(dto:updateoraddAboutDTO , id : number){

        const company = await this.userRepository
            .createQueryBuilder("company")
            .where("company.id = :id", { id })
            .getOne();

        if(!company) throw new BadRequestException('no company found')
        
        const { About } = dto

        if(About) {
            company.About= About
        
            await this.userRepository.save(company)
        }

        return company.About
    }



    public async profileCompleteUser(id:number){
        const user= await this.userRepository.findOne({
            where:{id}
        })

        if(!user) throw new BadRequestException('no user found')

        let percentage=40

        const skillsCompleted = user.skillsORspecializations?.length > 0;
        const experienceCompleted = user.experience?.length > 0;

        if(skillsCompleted) percentage += 30

        if(experienceCompleted) percentage += 30

        return {
            percentage,
            sections:{
                basicInfo:true,
                skillsCompleted,
                experienceCompleted
            }
        }
    }

    public async dashboardStatisticsUser(id:number){

        const user= await this.userRepository.findOne({
            where:{id}
        })

        if(!user) throw new BadRequestException('no user found')

        const totalApplicant= await this.jobApplicantRepository.count({
            where :{
                applicant:{id},
                createdAt:MoreThan(this.getDateBeforeMonths(3))
            }
        })

        const inReview= await this.jobApplicantRepository.count({
            where :{
                applicant:{id},
                createdAt:MoreThan(this.getDateBeforeMonths(3)),
                status:CandidateStatus.SCREENING
            }
        })

        const interview= await this.jobApplicantRepository.count({
            where :{
                applicant:{id},
                createdAt:MoreThan(this.getDateBeforeMonths(3)),
                status:CandidateStatus.INTERVIEW
            }
        })

        return {
            totalApplicant,
            inReview,
            interview
        }
    }

    public async profileCompleteCompany(id:number){
        const company= await this.userRepository.findOne({
            where:{id}
        })

        if(!company) throw new BadRequestException('no user found')

        let percentage=40

        const AboutCompleted = !!company.About?.trim()
        const specializationsCompleted = company.skillsORspecializations?.length > 0;
        

        if(AboutCompleted) percentage += 30

        if(specializationsCompleted) percentage += 30

        return {
            percentage,
            sections:{
                basicInfo:true,
                AboutCompleted,
                specializationsCompleted
            }
        }
    }

    private getDateBeforeMonths(month:number){
        const date= new Date()

        date.setMonth(date.getMonth()-month)

        return date
    }
}