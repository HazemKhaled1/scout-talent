import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from "@nestjs/common";
import { JobServices } from "./job.service";
import { addJobDTO } from "./dto/addJob.dto";
import { RoleUser } from "src/utils/Enums/user.enum";
import { updateJobDTO } from "./dto/updateJob.dto";
import type { JwtPayloadType } from "src/utils/type";
import { applyJobDTO } from "./dto/applyJob.dto";
import { Roles } from "../auth/decorator/user_role.decorator";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { currentUser } from "../auth/decorator/currentUser.decorator";
import { jobStatusDTO } from "./dto/statusJob.dto";
import { ApiBody, ApiSecurity } from "@nestjs/swagger";

@Controller('jobs')
export class JobController{

    constructor(
        private jobService : JobServices
    ){}

    @Post('createJob')
    @Roles(RoleUser.COMPANY)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async CreateJob(
        @Body() body:addJobDTO, 
        @currentUser() company:JwtPayloadType 
    ){
        const data = await this.jobService.Addjob(body,company.id)
        return {data}
    }

    @Get('allJob')
    @Roles(RoleUser.APPLICANT)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async GetAllJobs(){
        const data =await this.jobService.getAllJob()
        return {data}
    }


    @Get('jobs/:id')
    public async GetJob(
        @Param('id' , ParseIntPipe) id: number
    ){
        const data = await this.jobService.getJob(id)
        return {data}
    }

    @Post('applyJob/:jobId/:cvId')
    @Roles(RoleUser.APPLICANT)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async applyJob(
        @currentUser() user:JwtPayloadType, 
        @Param('jobId',ParseIntPipe) jobId:number,
        @Param('cvId',ParseIntPipe ) cvId:number,
        @Body() body:applyJobDTO
    ){
        const data= await this.jobService.applyJob(user.id ,jobId ,cvId,body)
        return {data}
    }

    @Delete('/:id')
    @Roles(RoleUser.COMPANY)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async deleteJob(
        @currentUser() company:JwtPayloadType,
        @Param('id',ParseIntPipe) id: number
    ){
        const data = await this.jobService.deleteJob( company.id , id )
        return {data}
    }

    @Put('/:id')
    @Roles(RoleUser.COMPANY)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    @ApiBody({ type : updateJobDTO })
    public async updateJob(
        @currentUser() company: JwtPayloadType,
        @Param('id',ParseIntPipe) id: number,
        @Body() body: updateJobDTO
    ){
        const data = await this.jobService.updateJob( company.id , id , body )
        return {data}
    }

    @Get('screenCV/:jobId/:userId')
    @Roles(RoleUser.COMPANY)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async screenCV (
        @currentUser() company : JwtPayloadType,
        @Param( 'jobId' , ParseIntPipe ) jobId : number,
        @Param( 'userId' , ParseIntPipe ) userId : number,
    ){
        const data = await this.jobService.screeningCV( company.id , jobId , userId )
        return {data}
    }

    @Get('rejectedCV/:jobId/:userId')
    @Roles(RoleUser.COMPANY)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async rejectedCV (
        @currentUser() company : JwtPayloadType,
        @Param('jobId',ParseIntPipe) jobId: number,
        @Param('userId',ParseIntPipe) userId : number
    ){
        const data = await this.jobService.rejectCV( company.id , jobId , userId )
        return {data}
    }

    @Get('hiredCV/:jobId/:userId')
    @Roles(RoleUser.COMPANY)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async hiredCV (
        @currentUser() company : JwtPayloadType,
        @Param('jobId',ParseIntPipe) jobId: number,
        @Param('userId',ParseIntPipe) userId : number
    ){
        const data = await this.jobService.hiredCV( company.id , jobId , userId )
        return {data}
    }

    @Post('/:jobId/status')
    @Roles(RoleUser.COMPANY)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async jobStatusChanging(
        @currentUser() company:JwtPayloadType,
        @Param("jobId" , ParseIntPipe ) jobId : number,
        @Body() body : jobStatusDTO
    ){
        const data = await this.jobService.ChangeJobStatus(company.id , jobId , body )
        return {data}
    }
}