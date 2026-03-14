import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Experience } from "./experience.entity";
import { ExperienceController } from "./experience.controller";
import { ExperienceService } from "./experience.service";
import { UserModule } from "../Users/user.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
    controllers:[ExperienceController],
    providers:[ExperienceService],
    imports:[
        UserModule,
        JwtModule,
        TypeOrmModule.forFeature([Experience])
    ]
})
export class ExperienceModule{}