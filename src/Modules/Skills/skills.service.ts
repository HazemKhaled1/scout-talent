import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { addSkillDTO } from "./dto/addSkill.dto";
import { UserService } from "../Users/user.service";
import { SkillOrSpecializations } from "./skills.entity";


@Injectable()
export class SkillService{

    constructor(@InjectRepository(SkillOrSpecializations) 
    private skillRepository : Repository<SkillOrSpecializations>,
        private userService:UserService

    ){}

    public async addSkill(dto:addSkillDTO ,Id:number){

        const {name} = dto

        const user = await this.userService.findUser(Id)
        if(!user)throw new BadRequestException('not user found')

        const skill = await this.skillRepository.findOne({where:{name}})
        if(skill) throw new BadRequestException('this name already in your information')

        const NSkill=this.skillRepository.create({name ,userORcompany:user})

        await this.skillRepository.save(NSkill)

        return {message:'add successful'}
    }

    public async deleteSkill(id:number , userId : number){

        const skill = await this.skillRepository.findOne({
            where:{
                id,
                userORcompany:{ id : userId }
            }
        })

        if(!skill) throw new BadRequestException('no found ')

        await this.skillRepository.remove(skill)

        return {message:'delete successful'}
    }

}