import { BadRequestException, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Express} from 'express'
import { CVService } from "./cv.service";
import type { JwtPayloadType } from "src/utils/type";
import { Roles } from "../auth/decorator/user_role.decorator";
import { RoleUser } from "src/utils/Enums/user.enum";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { currentUser } from "../auth/decorator/currentUser.decorator";
import { ApiBody, ApiConsumes, ApiSecurity } from "@nestjs/swagger";
import { uploadImageDTO } from "./dto/cvUpload.dto";

@Controller()
export class CVController{

    constructor(private cvService:CVService){}

    @Post('/files/upload-cv')
    @Roles(RoleUser.APPLICANT)
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('cv'))
    @ApiSecurity('bearer')
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: uploadImageDTO})
    public async uploadCV(
        @currentUser() user : JwtPayloadType,
        @UploadedFile() file:Express.Multer.File
    ){
        if(!file) throw new BadRequestException('no file upload')
            
        return await this.cvService.uploadCV(user.id,file.path)
    }
}