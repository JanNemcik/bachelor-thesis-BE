import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './service/app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseTransformInterceptor } from './config/response-transform.interceptor';
import { AuthModule } from './auth';
import { AdminModule } from './admin/admin.module';
import { MainModule } from './main/main.module';
import { GatewayService } from './service/gateway.service';
import { EventsGateway } from './config/events.gateway';
import mongoose = require('mongoose');

mongoose.set('debug', true);
@Module({
  imports: [
    AuthModule,
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: 'mongodb://iot.itprof.sk:27017/bachelor-iot'
      })
    }),
    AdminModule,
    MainModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor
    },
    GatewayService,
    EventsGateway
  ]
})
export class AppModule {}
