import { RoleUser } from "../Enums/user.enum";

export type JwtPayloadType = {
  id: string;
  role: RoleUser;
};
