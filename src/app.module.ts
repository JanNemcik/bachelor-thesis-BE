import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './service/app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ResponseTransformInterceptor } from './config/response-transform.interceptor';
import { AuthModule } from './auth';
import { AdminModule } from './admin/admin.module';
import { MainModule } from './main/main.module';
import { GatewayService } from './service/gateway.service';
import { EventsGateway } from './config/events.gateway';
import { DATABASE_OPTIONS_LOCAL } from './shared';
import { LOG_SCHEMA } from './data';
import { MqttService } from './service/mqtt.service';
import { MqttProvider } from './service/mqtt.provider';
import { SharedModule } from './shared/shared.module';

import mongoose = require('mongoose');

mongoose.set('debug', true);
@Module({
  imports: [
    AuthModule,
    MongooseModule.forRootAsync(DATABASE_OPTIONS_LOCAL),
    AdminModule,
    MainModule,
    SharedModule
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
