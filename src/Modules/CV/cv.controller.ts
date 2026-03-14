import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Express } from "express";
import { CVService } from "./cv.service";
import type { JwtPayloadType } from "src/Shared/types/JwtPayloadType";
import { Roles } from "../../Shared/decorator/user_role.decorator";
import { RoleUser } from "src/Shared/Enums/user.enum";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { currentUser } from "../../Shared/decorator/currentUser.decorator";
import { ApiBody, ApiConsumes, ApiSecurity } from "@nestjs/swagger";
import { uploadImageDTO } from "./dto/cvUpload.dto";

@Controller("cv")
export class CVController {
  constructor(private cvService: CVService) {}

  @Post("/upload-cv")
  @Roles(RoleUser.APPLICANT)
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor("cv"))
  @ApiSecurity("bearer")
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: uploadImageDTO })
  public async uploadCV(
    @currentUser() user: JwtPayloadType,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException("no file upload");
    
    const data = await this.cvService.uploadCV(user.id, file.path ,file.originalname);

    return { data };
  }

  @Get("/getAll")
  @Roles(RoleUser.APPLICANT)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async AllCV(
    @currentUser() user: JwtPayloadType
  ) {
    const data = await this.cvService.getAllCVFromUser(user.id);

    return { data };
  }

  @Delete("/delete/:id")
  @Roles(RoleUser.APPLICANT)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async deleteCV(
    @currentUser() user: JwtPayloadType,
    @Param("id") id: string,
  ) {
    const data = await this.cvService.deleteCV(user.id, id);

    return { data };
  }
}
