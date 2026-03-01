import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from "@nestjs/common";
import { JobServices } from "./job.service";
import { addJobDTO } from "./dto/addJob.dto";
import { RoleUser } from "src/utils/Enums/user.enum";
import { updateJobDTO } from "./dto/updateJob.dto";
import type { JwtPayloadType } from "src/utils/type";
import { CandidateStatus } from "src/utils/Enums/candidateStatus.enum";
import { applyJobDTO } from "./dto/applyJob.dto";
import { Roles } from "../auth/decorator/user_role.decorator";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { currentUser } from "../auth/decorator/currentUser.decorator";
import { JobStatus, JobType, WorkMode } from "src/utils/Enums/job.enum";
import { jobStatusDTO } from "./dto/statusJob.dto";
import { ApiSecurity } from "@nestjs/swagger";

@Controller()
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
        return await this.jobService.Addjob(body,company.id)
    }

    @Get('allJob')
    @Roles(RoleUser.APPLICANT)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async GetAllJobs(){
        return await this.jobService.getAllJob()
    }

    @Get('company/jobs')
    @Roles(RoleUser.COMPANY)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async GetAllJobsByCompany(
        @currentUser() company: JwtPayloadType,
        @Query('q') q?:JobStatus,
    ){
        return await this.jobService.GetAllJobsByCompany(company.id , q)
    }

    @Get('company/jobsApply')
    @Roles(RoleUser.COMPANY)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async GetAllJobsByCompanyApply(
        @currentUser() company: JwtPayloadType,
        @Query('q') q?:string,
        @Query('s') status?:CandidateStatus
    ){
        return await this.jobService.GetAllJobsByCompanyApply(company.id, q, status)
    }

    @Get('jobs/:id')
    public async GetJob(
        @Param('id' , ParseIntPipe) id: number
    ){
        return await this.jobService.getJob(id)
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
        return await this.jobService.applyJob(user.id ,jobId ,cvId,body)
    }

    @Delete('company/jobs/:id')
    @Roles(RoleUser.COMPANY)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async deleteJob(
        @currentUser() company:JwtPayloadType,
        @Param('id',ParseIntPipe) id: number
    ){
        return await this.jobService.deleteJob( company.id , id )
    }

    @Put('company/jobs/:id')
    @Roles(RoleUser.COMPANY)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async updateJob(
        @currentUser() company: JwtPayloadType,
        @Param('id',ParseIntPipe) id: number,
        @Body() body: updateJobDTO
    ){
        return await this.jobService.updateJob( company.id , id , body )
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
        return await this.jobService.screeningCV( company.id , jobId , userId )
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
        return await this.jobService.rejectCV( company.id , jobId , userId )
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
        return await this.jobService.hiredCV( company.id , jobId , userId )
    }

    @Get('applicantJobByApplicant')
    @Roles(RoleUser.APPLICANT)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async applicantJobByApplicant(
        @currentUser() user:JwtPayloadType,
        @Query('search') search?: string,
        @Query('location') location?: string,
        @Query('jobType') jobType?: JobType,
        @Query('workMode') workMode?: WorkMode,

    ){
        return await this.jobService.jobApplicantionByUser(user.id , search ,location ,jobType , workMode)
    }

    @Get('company/dashboard-stats')
    @Roles(RoleUser.COMPANY)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async dashboardStatistics (
        @currentUser() company:JwtPayloadType
    ){
        return await this.jobService.dashboardStatisticsCompany(company.id)
    } 
    @Post('company/jobs/:jobId/status')
    @Roles(RoleUser.COMPANY)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async jobStatus(
        @currentUser() company:JwtPayloadType,
        @Param("jobId" , ParseIntPipe ) jobId : number,
        @Body() body : jobStatusDTO
    ){
        return await this.jobService.ChangeJobStatus(company.id , jobId , body )
    }
}