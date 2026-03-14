import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { RoleUser } from "src/Shared/Enums/user.enum";

export class userRoleDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  role: RoleUser;
}
