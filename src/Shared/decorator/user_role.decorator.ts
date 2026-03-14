import { SetMetadata } from "@nestjs/common";
import { RoleUser } from "src/Shared/Enums/user.enum";

export const Roles=(...roles:RoleUser[])=>SetMetadata('roles',roles)