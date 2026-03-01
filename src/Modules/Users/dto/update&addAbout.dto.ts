import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class updateoraddAboutDTO{

    @IsOptional()
    @ApiPropertyOptional()
    About:string
}