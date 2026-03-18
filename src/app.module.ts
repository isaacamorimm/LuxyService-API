import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { ContactModule } from './contact/contact.module';
import { PrismaModule } from './prisma/prisma.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    UsersModule,
    ProjectsModule,
    ContactModule,
    PrismaModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
