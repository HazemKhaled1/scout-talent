
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'
export class updateUserDTO{

    @IsOptional()
    @ApiPropertyOptional()
    name:string

    @IsOptional()
    @ApiPropertyOptional()
    email:string

    @IsOptional()
    @ApiPropertyOptional()
    phone:string

    @IsOptional()
    @ApiPropertyOptional()
    location:string

    @IsOptional()
    @ApiPropertyOptional()
    linkesIn_profile:string

    @IsOptional()
    @ApiPropertyOptional()
    job_title:string
}