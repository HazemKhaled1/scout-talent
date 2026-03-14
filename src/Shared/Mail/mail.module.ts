import { Module } from "@nestjs/common"; 
import {MailerModule} from '@nestjs-modules/mailer' 
import { ConfigService } from "@nestjs/config"; 
import { join } from "path";
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter' 
import { MailService } from "./mail.service"; 
@Module({ 
    imports:[ 
        MailerModule.forRootAsync({ 
            inject:[ConfigService], 
            useFactory:(config:ConfigService)=>{
                return{ 
                    transport:{ 
                        host:'smtp.gmail.com',
                        port:587, 
                        secure:false, 
                        auth:{ user:config.get<string>("MAIL_USER"), 
                            pass:config.get<string>("MAIL_PASSWORD") }, 
                            tls: { rejectUnauthorized: false }, 
                            family: 4,
                    }, template:{ 
                        dir:join(__dirname,'templates'), 
                        adapter:new EjsAdapter({ inlineCssEnabled:true }) 
                    } 
                } 
            } 
        }) 
    ], 
    providers:[MailService], 
    exports:[MailService] 
}) 

export class MailModule{}