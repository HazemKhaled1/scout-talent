import { ApiProperty } from "@nestjs/swagger"
import { IsString,Length } from "class-validator"


export class resetPasswordDTO{
    @IsString()
    @Length(6,15)
    @ApiProperty()
    newPassword:string

}