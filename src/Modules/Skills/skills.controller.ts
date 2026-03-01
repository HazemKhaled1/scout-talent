import { Body, Controller, Delete, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { SkillService } from "./skills.service";
import { RoleUser } from "src/utils/Enums/user.enum";
import type { JwtPayloadType } from "src/utils/type";
import { addSkillDTO } from "./dto/addSkill.dto";
import { Roles } from "../auth/decorator/user_role.decorator";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { currentUser } from "../auth/decorator/currentUser.decorator";
import { ApiSecurity } from "@nestjs/swagger";

@Controller()
export class SkillController{

    constructor(
        private skillService:SkillService
    ){}

    @Post('applicant/skills')
    @Roles(RoleUser.APPLICANT , RoleUser.COMPANY)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async addSkill(
        @currentUser() user:JwtPayloadType,
        @Body() body:addSkillDTO
    ){
        return await this.skillService.addSkill(body,user.id)
    }

    @Delete('applicant/skills/:id')
    @Roles(RoleUser.APPLICANT , RoleUser.COMPANY)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async deleteSkill(
        @currentUser() user:JwtPayloadType,
        @Param('id',ParseIntPipe) id:number
    ){
        return await this.skillService.deleteSkill(id , user.id)
    }
}