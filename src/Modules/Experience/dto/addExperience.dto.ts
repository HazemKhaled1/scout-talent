import { ApiProperty } from "@nestjs/swagger"


export class addExperienceDTO{

    @ApiProperty()
    title:string

    @ApiProperty()
    company:string
    
    @ApiProperty()
    startDate:Date
    
    @ApiProperty()
    endDate:Date
    
    @ApiProperty()
    description:string
}