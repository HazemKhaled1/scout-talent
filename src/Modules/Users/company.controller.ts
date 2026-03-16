import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { Roles } from "../../Shared/decorator/user_role.decorator";
import { RoleUser } from "src/Shared/Enums/user.enum";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { ApiQuery, ApiSecurity } from "@nestjs/swagger";
import { currentUser } from "../../Shared/decorator/currentUser.decorator";
import type { JwtPayloadType } from "src/Shared/types/JwtPayloadType";
import { updateUserDTO } from "./dto/updateUser.dto";
import { updateoraddAboutDTO } from "./dto/update&addAbout.dto";
import { JobStatus } from "src/Shared/Enums/job.enum";
import { JobServices } from "../Job/job.service";

@Controller("company")
export class CompanyController {
  constructor(
    private userService: UserService,
    private jobService: JobServices,
  ) {}

  @Get("me")
  @Roles(RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async GetProfile(@currentUser() company: JwtPayloadType) {
    const me = await this.userService.findUser(company.id);
    return {
      data: me,
    };
  }

  @Get("me/basic_info")
  @Roles(RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async GetBasicInfo(@currentUser() payload: JwtPayloadType) {
    const company = await this.userService.basicInformation(payload.id);
    return {
      data: company,
    };
  }

  @Put("me/basic_info")
  @Roles(RoleUser.COMPANY)
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

  @Post("me/about")
  @Roles(RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async AboutCompany(
    @currentUser() company: JwtPayloadType,
    @Body() body: updateoraddAboutDTO,
  ) {
    const data = await this.userService.addorupdateAbout(body, company.id);

    return {
      data,
    };
  }

  @Get("me/completion")
  @Roles(RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async profileCompleteCompany(@currentUser() company: JwtPayloadType) {
    const data = await this.userService.profileCompleteCompany(company.id);
    return {
      data,
    };
  }

  @Get("me/dashboard-stats")
  @Roles(RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async dashboardStatistics(@currentUser() company: JwtPayloadType) {
    const data = await this.jobService.dashboardStatisticsCompany(company.id);
    return {
      data,
    };
  }

  @Get("me/jobs")
  @Roles(RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  @ApiQuery({ name: "q", required: false, enum: JobStatus })
  public async GetAllJobsByCompany(
    @currentUser() company: JwtPayloadType,
    @Query("q") q?: JobStatus,
  ) {
    const data = await this.jobService.GetAllJobsByCompany(company.id, q);
    return { data };
  }

}
