import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../Users/user.entity";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { MailService } from "../Mail/mail.service";
import { JwtService } from "@nestjs/jwt";
import { registerDTO } from "./dto/register.dto";
import bcrypt from 'bcrypt'
import { randomBytes } from 'node:crypto'
import { loginDTO } from "./dto/login.dto";
import { JwtPayloadType } from "src/utils/type";
import { forgetPasswordDTO } from "./dto/forget_password.dto";
import { resetPasswordDTO } from "./dto/reset_password.dto";

@Injectable()
export class AuthService{

    constructor(@InjectRepository(User) 
        private userRepository : Repository<User>,
        private config: ConfigService,
        private mailService :MailService,
        private jwtService:JwtService
    ){}

    /**
     * user register 
     * @param dto name , email, password, role
     * @returns message
     */
    public async register(dto:registerDTO){

        const {name , email , password ,linkedIn_profile ,phone ,location ,job_title , role} = dto

        const user = await this.userRepository.findOne( { where :{ email } } )

        if(user) throw new BadRequestException('Email already in DB')
        
        const saltOrRounds = 10;
        const hash = await bcrypt.hash(password, saltOrRounds);

        const Suser = this.userRepository.create({
            name , email , password:hash , role, phone,
            linkedIn_profile, location, job_title,
            verificationToken: randomBytes(32).toString('hex')
        })

        const newuser = await this.userRepository.save(Suser)

        const link = `${this.config.get<string>('DOMIN')}/api/user/verify-email/${newuser.id}/${newuser.verificationToken}`

        await this.mailService.sendVerifyEmail(email,link)

        return { message:'verification email has been send , please check your email' }
    }

    /**
     * user login
     * @param dto email , password
     * @returns message
     */
    public async login( dto:loginDTO ) {

        const {email , password} = dto

        const user = await this.userRepository.findOne( { where :{ email } } )
        if(!user) throw new BadRequestException('Email not found in DB ')

        const ckpass= await bcrypt.compare(password,user.password)
        if(!ckpass) throw new BadRequestException('password not correct')
        
        if( !user.isAccountVerified ) {
            throw new BadRequestException('not verify your email')
        }
        const payload:JwtPayloadType = { id : user.id ,role : user.role }

        const accessToken = await this.jwtService.signAsync( payload )

        const refreshToken = await this.jwtService.signAsync( payload,{
            secret: this.config.get<string>('JWT_Refresh_SECRET'),
            expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN')
        })
        
        const HrefreshToken = await bcrypt.hash(refreshToken,10)
        user.refreshToken = HrefreshToken

        await this.userRepository.save(user)

        return { message:'login successful', accessToken ,refreshToken}
    }

    public async getAccessToken(refreshToken:string){

        const payload:JwtPayloadType = await this.jwtService.verifyAsync(refreshToken,{
            secret:this.config.get<string>('JWT_Refresh_SECRET'),
            
        })

        const user= await this.userRepository.findOne({where:{id:payload.id}})

        if(!user || !user.refreshToken) throw new BadRequestException('Access denied')

        const isMatch= await bcrypt.compare(refreshToken , user.refreshToken)
        if(!isMatch) throw new BadRequestException('Invalid refresh token')

        const newAccessToken= await this.jwtService.signAsync({id:user.id,role:user.role})

        return {accessToken:newAccessToken}
    }

    public async logOut(id:number){

        const user = await this.userRepository.findOne({where:{id}})

        if(!user) throw new BadRequestException('not found user')

        user.refreshToken = ''
        await this.userRepository.save(user)

        return true
    }

    /**
     * to verify user's email
     * @param id user Id
     * @param verificationToken 
     * @returns message
     */
    public async verifyEmail(id:number , verificationToken:string){

        const user = await this.userRepository.findOne({where:{id}})
        if(!user) throw new BadRequestException('user not found')
        
        if(user.verificationToken ===null) throw new BadRequestException('there is no verification token')
        if(user.verificationToken !== verificationToken) throw new BadRequestException(' invalid link')
    
        user.isAccountVerified = true
        user.verificationToken = ''

        await this.userRepository.save(user) 

        return{message:'your email has been verify , you can log in now'}

    }

    /**
     * user forget password
     * @param dto email
     * @returns message
     */
    public async forgetPassword(dto:forgetPasswordDTO){
        const {email}=dto

        const user= await this.userRepository.findOne({where:{email}})

        if(!user) throw new BadRequestException('email not in DB')

        user.resetPasswordToken= randomBytes(32).toString('hex')

        await this.userRepository.save(user)

        const link = `${this.config.get<string>('DOMIN')}/api/user/reset_password/${user.id}/${user.resetPasswordToken}`
        
        await this.mailService.sendResetPassword(email,link)

        return{message:'check your email , click to link'}
    }

    /**
     * update user's password
     * @param dto new password
     * @param id user id
     * @param resetPasswordToken 
     * @returns message
     */
    public async resetPassword(
        dto:resetPasswordDTO , 
        id:number, 
        resetPasswordToken:string
    ){
        const {newPassword} = dto
        const user= await this.userRepository.findOne({where:{id}})

        if (!user) throw new BadRequestException('please try again')
        
        if(user.resetPasswordToken==='') throw new BadRequestException('there is no verification token')

        if(user.resetPasswordToken!== resetPasswordToken) throw new BadRequestException('invalid link')

        const hashPassword= await bcrypt.hash(newPassword,10)

        user.password=hashPassword
        user.resetPasswordToken=''

        await this.userRepository.save(user)

        return {message :'password update successful'}
    }
}