import { Body, Controller, Delete, Param, ParseIntPipe, Post, Put, UseGuards } from "@nestjs/common";
import { ExperienceService } from "./experience.service";
import { RoleUser } from "src/utils/Enums/user.enum";
import { addExperienceDTO } from "./dto/addExperience.dto";
import type { JwtPayloadType } from "src/utils/type";
import { updateExperienceDTO } from "./dto/updateExperience.dto";
import { Roles } from "../auth/decorator/user_role.decorator";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { currentUser } from "../auth/decorator/currentUser.decorator";
import { ApiSecurity } from "@nestjs/swagger";


@Controller('users/me')
export class ExperienceController{

    constructor(
        private experienceService:ExperienceService
    ){}

    @Post('experiences')
    @Roles(RoleUser.APPLICANT)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async addExperience(
        @Body() body:addExperienceDTO,
        @currentUser() user : JwtPayloadType
    ){
        const data = await this.experienceService.addExperience(body,user.id)
        return {data}
    }

    @Put('experiences/:id')
    @Roles(RoleUser.APPLICANT)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async updateExperience(
        @Body() body:updateExperienceDTO ,
        @Param('id' , ParseIntPipe) id:number
    ){
        const data = await this.experienceService.updateExperience(body,id)
        return {data}
    }

    @Delete('experiences/:id')
    @Roles(RoleUser.APPLICANT)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async deleteExperience(@Param('id' , ParseIntPipe) id:number){
        const data = await this.experienceService.deleteExperience(id)
        return {data}
    }
}