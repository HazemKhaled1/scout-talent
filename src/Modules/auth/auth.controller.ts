import { Body, Controller, Post ,Res, Req, BadRequestException, UseGuards, Get, Param, ParseIntPipe} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { registerDTO } from "./dto/register.dto";
import { loginDTO } from "./dto/login.dto";
import type { Response , Request } from "express";
import { Roles } from "./decorator/user_role.decorator";
import { RoleUser } from "src/utils/Enums/user.enum";
import { AuthGuard } from "./guards/AuthUser.guard";
import { currentUser } from "./decorator/currentUser.decorator";
import type { JwtPayloadType } from "src/utils/type";
import { forgetPasswordDTO } from "./dto/forget_password.dto";
import { resetPasswordDTO } from "./dto/reset_password.dto";
import { ApiSecurity } from "@nestjs/swagger";

interface RequestWithCookies extends Request{
    cookies:{
        refreshToken?:string
    }
}

@Controller()
export class AuthController{

    constructor(
        private authService: AuthService
    ){}

    @Post('register')
    public async register(
        @Body() body:registerDTO
    ){
        const response=await this.authService.register(body)
        return response
    }

    @Post('login')
    public async login(
        @Res({ passthrough: true }) res:Response,
        @Body() body:loginDTO
    ){
        const {message,accessToken,refreshToken}= await this.authService.login(body)

        res.cookie('refreshToken',refreshToken,{
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return { message, accessToken}

    }

    @Post('refreshToken')
    public async getAccessToken(
        @Req() req:RequestWithCookies
    ){
        const refreshToken = req.cookies.refreshToken

        if(!refreshToken) throw new BadRequestException('no refresh token')

        return await this.authService.getAccessToken(refreshToken)
    }

    @Post('logOut')
    @Roles(RoleUser.APPLICANT,RoleUser.COMPANY)
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    public async logOut(
        @currentUser() user :JwtPayloadType,
        @Res({ passthrough: true }) res:Response
    ){
        await this.authService.logOut(user.id)

        res.clearCookie('refreshToken',{
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        })

        return {msg:'log out successful'}
    }

    @Get('user/verify-email/:id/:verificationToken')
    public async verifyEmail(
        @Param('id' , ParseIntPipe) id :number ,
        @Param('verificationToken') verificationToken:string
    ){
        return await this.authService.verifyEmail(id,verificationToken)
    }

    @Post('user/forget-password')
    public async forgetPassword(
        @Body() body:forgetPasswordDTO
    ){
        return await this.authService.forgetPassword(body)
    }

    @Post('user/reset_password/:id/:resetPasswordToken')
    public async resetPassword(
        @Param('resetPasswordToken') resetPasswordToken:string ,
        @Param('id', ParseIntPipe) id : number,
        @Body() body : resetPasswordDTO
    ){
        return await this.authService.resetPassword(body ,id,resetPasswordToken)
    }
}