import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { JobServices } from "./job.service";
import { Roles } from "src/Shared/decorator/user_role.decorator";
import { RoleUser } from "src/Shared/Enums/user.enum";
import { ApiQuery, ApiSecurity } from "@nestjs/swagger";
import { CandidateStatus } from "src/Shared/Enums/candidateStatus.enum";
import { currentUser } from "src/Shared/decorator/currentUser.decorator";
import type { JwtPayloadType } from "src/Shared/types/JwtPayloadType";
import { AuthGuard } from "../auth/guards/AuthUser.guard";

@Controller("candidate")
export class CandidateController {
  constructor(private jobService: JobServices) {}

  @Get("jobsApply")
  @Roles(RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  @ApiQuery({ name: "q", required: false, type: String })
  @ApiQuery({ name: "s", required: false, enum: CandidateStatus })
  public async GetAllJobsByCompanyApply(
    @currentUser() company: JwtPayloadType,
    @Query("q") q?: string,
    @Query("s") status?: CandidateStatus,
  ) {
    const data = await this.jobService.GetAllJobsByCompanyApply(
      company.id,
      q,
      status,
    );
    return { data };
  }

  @Get("screenCV/:jobId/:userId")
  @Roles(RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async screenCV(
    @currentUser() company: JwtPayloadType,
    @Param("jobId") jobId: string,
    @Param("userId") userId: string,
  ) {
    const data = await this.jobService.screeningCV(company.id, jobId, userId);
    return { data };
  }

  @Get("rejectedCV/:jobId/:userId")
  @Roles(RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async rejectedCV(
    @currentUser() company: JwtPayloadType,
    @Param("jobId") jobId: string,
    @Param("userId") userId: string,
  ) {
    const data = await this.jobService.rejectCV(company.id, jobId, userId);
    return { data };
  }

  @Get("hiredCV/:jobId/:userId")
  @Roles(RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async hiredCV(
    @currentUser() company: JwtPayloadType,
    @Param("jobId") jobId: string,
    @Param("userId") userId: string,
  ) {
    const data = await this.jobService.hiredCV(company.id, jobId, userId);
    return { data };
  }

}
