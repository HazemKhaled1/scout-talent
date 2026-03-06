import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"


export class addExperienceDTO{

    @IsString()
    @ApiProperty()
    title:string

    @IsString()
    @ApiProperty()
    company:string
    
    @IsString()
    @ApiProperty({ type: String, format: 'date' })
    startDate:Date
    
    @IsString()
    @ApiProperty({ type: String, format: 'date' })
    endDate:Date
    
    @IsString()
    @ApiProperty()
    description:string
}