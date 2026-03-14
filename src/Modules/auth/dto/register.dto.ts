import { RoleUser } from 'src/Shared/Enums/user.enum' 
import { IsString , IsEmail , IsNotEmpty , Length} from 'class-validator'
import { ApiProperty } from "@nestjs/swagger"

export class registerDTO{
    @IsString()
    @ApiProperty()
    name:string

    @IsEmail()
    @IsNotEmpty()
    @ApiProperty()
    email:string

    @IsString()
    @Length(6,15)
    @ApiProperty()
    password:string

    @IsString()
    @ApiProperty()
    phone:string

    @IsString()
    @ApiProperty()
    job_title:string

    @IsString()
    @ApiProperty()
    location:string

    @IsString()
    @ApiProperty()
    linkedIn_profile:string

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    role:RoleUser
}