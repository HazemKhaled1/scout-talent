import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class resendEmailVerify {

    @IsEmail()
    @ApiProperty()
    email : string
}