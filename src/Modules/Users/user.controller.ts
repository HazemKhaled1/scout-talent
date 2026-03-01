import { Body, Controller, Get, Post, Put, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiSecurity } from '@nestjs/swagger'
import type { JwtPayloadType } from "src/utils/type";
import { Roles } from "../auth/decorator/user_role.decorator";
import { RoleUser } from "src/utils/Enums/user.enum";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { currentUser } from "../auth/decorator/currentUser.decorator";
import { updateUserDTO } from "./dto/updateUser.dto";
import { updateoraddAboutDTO } from "./dto/update&addAbout.dto";

@Controller()
export class UserController{

    constructor(
        private userService : UserService
    ){}


    @Get('user/profile')
    @Roles(RoleUser.APPLICANT , RoleUser.COMPANY)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async GetProfile(
        @currentUser() user : JwtPayloadType
    ){
        return await this.userService.findUser(user.id)
    }

    @Get('user/basic_info')
    @Roles(RoleUser.APPLICANT , RoleUser.COMPANY)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async GetBasicInfo(
        @currentUser() payload : JwtPayloadType
    ){
        return await this.userService.basicInformation(payload.id)
    }

    @Put('user/basic_info')
    @Roles(RoleUser.APPLICANT , RoleUser.COMPANY)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async updateBasicInfo(
        @currentUser() payload : JwtPayloadType ,
        @Body() body : updateUserDTO
    ){
        return await this.userService.updateProfile( body , payload.id)
    }

    @Post('company/about')
    @Roles(RoleUser.COMPANY)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async AboutCompany(
        @currentUser() company : JwtPayloadType ,
        @Body() body : updateoraddAboutDTO
    ){
        return await this.userService.addorupdateAbout(body , company.id)
    }

    @Get('user/completion')
    @Roles(RoleUser.APPLICANT)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async profileCompleteUser(
        @currentUser() user:JwtPayloadType
    ){
        return await this.userService.profileCompleteUser(user.id)
    }

    @Get('user/dashboard-stats')
    @Roles(RoleUser.APPLICANT)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async dashboardStatistics (
        @currentUser() user:JwtPayloadType
    ){
        return await this.userService.dashboardStatisticsUser(user.id)
    }

    @Get('company/completion')
    @Roles(RoleUser.COMPANY)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async profileCompleteCompany (
        @currentUser() company:JwtPayloadType
    ){
        return await this.userService.profileCompleteCompany(company.id)
    }
}