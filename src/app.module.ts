import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseTransformInterceptor } from './config/response-transform.interceptor';
import { AuthModule } from './auth';
import { AdminModule } from './admin/admin.module';
import { MainModule } from './main/main.module';
import { DATABASE_OPTIONS_LOCAL, DATABASE_OPTIONS_DEV } from './shared';
import { SharedModule } from './shared/shared.module';
import { DatabaseModule } from './database/database.module';

import mongoose = require('mongoose');

mongoose.set('debug', true);
@Module({
  imports: [
    MongooseModule.forRootAsync(DATABASE_OPTIONS_DEV),
    AuthModule,
    AdminModule,
    MainModule,
    SharedModule,
    DatabaseModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor
    }
  ]
})
export class AppModule {}
