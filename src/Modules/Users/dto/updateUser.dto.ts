
import { ApiPropertyOptional } from '@nestjs/swagger'
export class updateUserDTO{

    @ApiPropertyOptional()
    name:string

    @ApiPropertyOptional()
    email:string

    @ApiPropertyOptional()
    phone:string

    @ApiPropertyOptional()
    location:string

    @ApiPropertyOptional()
    linkesIn_profile:string

    @ApiPropertyOptional()
    job_title:string
}