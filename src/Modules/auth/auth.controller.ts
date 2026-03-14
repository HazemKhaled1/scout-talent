import {
  Body,
  Controller,
  Post,
  Res,
  Req,
  BadRequestException,
  UseGuards,
  Get,
  Param,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { registerDTO } from "./dto/register.dto";
import { loginDTO } from "./dto/login.dto";
import type { Response, Request } from "express";
import { Roles } from "../../Shared/decorator/user_role.decorator";
import { AuthGuard } from "./guards/AuthUser.guard";
import { currentUser } from "../../Shared/decorator/currentUser.decorator";
import { forgetPasswordDTO } from "./dto/forget_password.dto";
import { resetPasswordDTO } from "./dto/reset_password.dto";
import { ApiSecurity } from "@nestjs/swagger";
import { resendEmailVerify } from "./dto/resendEmailVerify.dto";
import { GoogleAuthGuard } from "./guards/google_auth.guard";
import { userRoleDTO } from "./dto/userRole.dto";
import { RoleUser } from "src/Shared/Enums/user.enum";
import type { JwtPayloadType } from "src/Shared/types/JwtPayloadType";

interface RequestWithCookies extends Request {
  cookies: {
    refreshToken?: string;
  };
}

interface GoogleAuth {
  email: string;
  name: string;
}
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  public async register(@Body() body: registerDTO) {
    const response = await this.authService.register(body);

    return { data: response };
  }

  @Post("login")
  public async login(
    @Res({ passthrough: true }) res: Response,
    @Body() body: loginDTO,
  ) {
    const { message, accessToken, refreshToken } =
      await this.authService.login(body);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      data: { message, accessToken },
    };
  }

  @Post("resendEmailVerify")
  public async resendEmailVerify(@Body() body: resendEmailVerify) {
    const msg = await this.authService.resendEmailVerify(body);
    return {
      data: msg,
    };
  }

  @Post("refreshToken")
  public async getAccessToken(@Req() req: RequestWithCookies) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) throw new BadRequestException("no refresh token");

    const data = await this.authService.getAccessToken(refreshToken);

    return { data };
  }

  @Post("logOut")
  @Roles(RoleUser.APPLICANT, RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async logOut(
    @currentUser() user: JwtPayloadType,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logOut(user.id);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return { data: { msg: "log out successful" } };
  }

  @Get("verify-email/:id/:verificationToken")
  public async verifyEmail(
    @Param("id") id: string,
    @Param("verificationToken") verificationToken: string,
  ) {
    const data = await this.authService.verifyEmail(id, verificationToken);
    return { data };
  }

  @Post("forget-password")
  public async forgetPassword(@Body() body: forgetPasswordDTO) {
    const msg = await this.authService.forgetPassword(body);
    return { data: msg };
  }

  @Post("reset_password/:id/:resetPasswordToken")
  public async resetPassword(
    @Param("resetPasswordToken") resetPasswordToken: string,
    @Param("id") id: string,
    @Body() body: resetPasswordDTO,
  ) {
    const msg = await this.authService.resetPassword(
      body,
      id,
      resetPasswordToken,
    );
    return {
      data: msg,
    };
  }

  @Get("google")
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  public async googleAuthRedirect(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const { email, name } = req.user as GoogleAuth;

    if (!email || !name)
      throw new BadRequestException("something false, please try again");

    const { message, needRole, token, userId } =
      await this.authService.GoogleAuth(email, name);
    if (needRole && !token) {
      return {
        data: {
          message,
          needRole,
          userId,
        },
      };
    }

    res.cookie("refreshToken", token?.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      data: { message, accessToken: token?.accessToken },
    };
  }

  @Post("select-role/:id")
  public async userRole(
    @Res({ passthrough: true }) res: Response,
    @Body() body: userRoleDTO,
    @Param("id") id: string,
  ) {
    const { message, refreshToken, accessToken } =
      await this.authService.SelectRoleuser(body, id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      data: { message, accessToken },
    };
  }
}
