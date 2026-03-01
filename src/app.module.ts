import { ConfigModule} from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {Module} from '@nestjs/common'
import { UserModule } from './Modules/Users/user.module';
import { MailModule } from './Modules/Mail/mail.module';
import { CVModule } from './Modules/CV/cv.module';
import { JobModule } from './Modules/Job/job.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { SkillModule } from './Modules/Skills/skills.module';
import { ExperienceModule } from './Modules/Experience/experience.module';
import { AuthModule } from './Modules/auth/auth.module';
import { dataSourceOptions } from 'db/data_source';

@Module({
  imports: [
    UserModule,
    CVModule,
    JobModule,
    SkillModule,
    ExperienceModule,
    MailModule,
    AuthModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    ConfigModule.forRoot({
      isGlobal:true,
      envFilePath:'.env'
    }),
    ThrottlerModule.forRoot([
      {
        ttl:60000,
        limit:10
      }
    ])
  ]
})

export class AppModule {}
