import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { JwtPayloadType } from "src/Shared/types/JwtPayloadType";


export const currentUser = createParamDecorator(
  (data, context: ExecutionContext) => {
    const request: Request = context.switchToHttp().getRequest();

    const user = request["user"] as JwtPayloadType;

    return user;
  },
);
