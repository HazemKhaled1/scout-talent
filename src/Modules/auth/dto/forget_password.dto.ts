import { ApiProperty } from "@nestjs/swagger";
import { IsEmail , IsNotEmpty} from "class-validator";

export class forgetPasswordDTO{
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty()
    email:string
}