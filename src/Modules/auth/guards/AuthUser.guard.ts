import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { JwtPayloadType } from "src/Shared/types/JwtPayloadType";
import { Reflector } from "@nestjs/core";
import { RoleUser } from "src/Shared/Enums/user.enum";
import { UserService } from "../../Users/user.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private reflector: Reflector,
    private userService: UserService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const roles: RoleUser[] = this.reflector.getAllAndOverride("roles", [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles || roles.length === 0)
      throw new BadRequestException("no role provider");

    const request: Request = context.switchToHttp().getRequest();

    const [type, token] = request.headers.authorization?.split(" ") ?? [];

    if (token && type === "Bearer") {
      try {
        const payload: JwtPayloadType = await this.jwtService.verifyAsync(
          token,
          {
            secret: this.config.get<string>("JWT_Access_SECRET"),
          },
        );

        const user = await this.userService.findUser(payload.id);
        if (!user) return false;
        if (roles.includes(user.role)) {
          request["user"] = payload;
          return true;
        }
        return false;
      } catch (err) {
        throw new BadRequestException("invalid token" + err);
      }
    } else {
      throw new BadRequestException("no token provider");
    }
  }
}
