import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class addSkillDTO{

    @IsString()
    @ApiProperty()
    name:string
}