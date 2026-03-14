import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { SkillService } from "./skills.service";
import { RoleUser } from "src/Shared/Enums/user.enum";
import type { JwtPayloadType } from "src/Shared/types/JwtPayloadType";
import { addSkillDTO } from "./dto/addSkill.dto";
import { Roles } from "../../Shared/decorator/user_role.decorator";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { currentUser } from "../../Shared/decorator/currentUser.decorator";
import { ApiSecurity } from "@nestjs/swagger";

@Controller("companys/me")
export class SpecializationController {
  constructor(private skillService: SkillService) {}

  @Post("specializations")
  @Roles(RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async addSpecializations(
    @currentUser() company: JwtPayloadType,
    @Body() body: addSkillDTO,
  ) {
    const data = await this.skillService.addSkill(body, company.id);
    return { data };
  }

  @Delete("specializations/:id")
  @Roles(RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async deletespecializations(
    @currentUser() company: JwtPayloadType,
    @Param("id") id: string,
  ) {
    const data = await this.skillService.deleteSkill(id, company.id);
    return { data };
  }
}
