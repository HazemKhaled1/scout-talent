import { Body, Controller, Delete, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { SkillService } from "./skills.service";
import { RoleUser } from "src/utils/Enums/user.enum";
import type { JwtPayloadType } from "src/utils/type";
import { addSkillDTO } from "./dto/addSkill.dto";
import { Roles } from "../auth/decorator/user_role.decorator";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { currentUser } from "../auth/decorator/currentUser.decorator";
import { ApiSecurity } from "@nestjs/swagger";

@Controller('companys/me')
export class SpecializationController{

    constructor(
        private skillService:SkillService
    ){}

    @Post('specializations')
    @Roles(RoleUser.COMPANY)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async addSpecializations(
        @currentUser() company:JwtPayloadType,
        @Body() body:addSkillDTO
    ){
        const data =await this.skillService.addSkill(body,company.id)
        return {data}
    }

    @Delete('specializations/:id')
    @Roles(RoleUser.COMPANY)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async deletespecializations(
        @currentUser() company:JwtPayloadType,
        @Param('id',ParseIntPipe) id:number
    ){
        const data = await this.skillService.deleteSkill(id , company.id)
        return {data}
    }
}