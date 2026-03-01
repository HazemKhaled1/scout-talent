import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsOptional } from "class-validator"


export class updateExperienceDTO{

    @IsOptional()
    @ApiPropertyOptional()
    title:string

    @IsOptional()
    @ApiPropertyOptional()
    company:string

    @IsOptional()
    @ApiPropertyOptional()
    startDate:Date

    @IsOptional()
    @ApiPropertyOptional()
    endDate:Date

    @IsOptional()
    @ApiPropertyOptional()
    description:string
}