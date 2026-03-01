import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet'
import { ValidationPipe } from '@nestjs/common';
import { config } from 'dotenv';
config()
async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api')

  app.use(helmet())

  app.use(cookieParser())

  app.useGlobalPipes(new ValidationPipe({
    whitelist:true,
    forbidNonWhitelisted:true
  }))

  const swagger= new DocumentBuilder()
  .setTitle(' Scout Talent ')
  .setVersion('1.0')
  .addSecurity('bearer' , { type : "http" , scheme:'bearer'})
  .addBearerAuth()
  .build()

  const document= SwaggerModule.createDocument(app,swagger)

  SwaggerModule.setup('swagger',app,document)

  await app.listen(process.env.PORT || 3000);
}
bootstrap();