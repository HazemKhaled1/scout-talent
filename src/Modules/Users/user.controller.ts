import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiQuery, ApiSecurity } from "@nestjs/swagger";
import type { JwtPayloadType } from "src/Shared/types/JwtPayloadType";
import { Roles } from "../../Shared/decorator/user_role.decorator";
import { RoleUser } from "src/Shared/Enums/user.enum";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { currentUser } from "../../Shared/decorator/currentUser.decorator";
import { updateUserDTO } from "./dto/updateUser.dto";
import { JobType, WorkMode } from "src/Shared/Enums/job.enum";
import { JobServices } from "../Job/job.service";

@Controller("user")
export class UserController {
  constructor(
    private userService: UserService,
    private jobService: JobServices,
  ) {}

  @Get("/me")
  @Roles(RoleUser.APPLICANT)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async GetProfile(@currentUser() payload: JwtPayloadType) {
    const user = await this.userService.findUser(payload.id);
    return {
      data: user,
    };
  }

  @Get("me/basic_info")
  @Roles(RoleUser.APPLICANT)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async GetBasicInfo(@currentUser() payload: JwtPayloadType) {
    const user = await this.userService.basicInformation(payload.id);
    return {
      data: user,
    };
  }

  @Put("me/basic_info")
  @Roles(RoleUser.APPLICANT)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async updateBasicInfo(
    @currentUser() payload: JwtPayloadType,
    @Body() body: updateUserDTO,
  ) {
    await this.userService.updateProfile(body, payload.id);
    return {
      data: true,
    };
  }

  @Get("me/completion")
  @Roles(RoleUser.APPLICANT)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async profileCompleteUser(@currentUser() user: JwtPayloadType) {
    const data = await this.userService.profileCompleteUser(user.id);
    return {
      data,
    };
  }

  @Get("me/dashboard-stats")
  @Roles(RoleUser.APPLICANT)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async dashboardStatistics(@currentUser() user: JwtPayloadType) {
    const data = await this.userService.dashboardStatisticsUser(user.id);
    return { data };
  }

  @Get("me/applicantJob")
  @Roles(RoleUser.APPLICANT)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "location", required: false, type: String })
  @ApiQuery({ name: "jobType", required: false, enum: JobType })
  @ApiQuery({ name: "workMode", required: false, enum: WorkMode })
  public async applicantJobByApplicant(
    @currentUser() user: JwtPayloadType,
    @Query("search") search?: string,
    @Query("location") location?: string,
    @Query("jobType") jobType?: JobType,
    @Query("workMode") workMode?: WorkMode,
  ) {
    const jobApply = await this.jobService.jobApplicantionByUser(
      user.id,
      search,
      location,
      jobType,
      workMode,
    );
    return {
      data: jobApply,
    };
  }

  @Get("me/applicantJob/:id")
  @Roles(RoleUser.APPLICANT)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async applicantJobByApplicantByID(
    @currentUser() user: JwtPayloadType,
    @Param("id") id: string,
  ) {
    const jobApply = await this.jobService.jobApplicantionByUserByID(
      user.id,
      id,
    );

    return {
      data: jobApply,
    };
  }
}
