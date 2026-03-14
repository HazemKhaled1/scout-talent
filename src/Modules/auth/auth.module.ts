import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { StringValue } from "ms";
import { MailModule } from "src/Shared/Mail/mail.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../Users/user.entity";
import { UserModule } from "../Users/user.module";
import { GoogleStrategy } from "./strategies/google.strategy";

@Module({
  controllers: [AuthController],
  providers: [AuthService,GoogleStrategy],
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          global: true,
          secret: config.get<string>("JWT_Access_SECRET"),
          signOptions: {
            expiresIn: config.get<string>(
              "JWT_Access_EXPIRES_IN",
            ) as StringValue,
          },
        };
      },
    }),
    MailModule,
    UserModule,
    TypeOrmModule.forFeature([User]),
  ],
})
export class AuthModule {}
