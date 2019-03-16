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
import mongoose = require('mongoose');
import { DATABASE_OPTIONS_LOCAL } from './shared';
import { LogsSchema } from './data';
import { MqttService } from './service/mqtt.service';
import { MqttProvider } from './service/mqtt.provider';

mongoose.set('debug', true);
@Module({
  imports: [
    AuthModule,
    MongooseModule.forRootAsync(DATABASE_OPTIONS_LOCAL),
    MongooseModule.forFeature([
      { name: 'LogsModel', schema: LogsSchema, collection: 'logs' }
    ]),
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
    EventsGateway,
    MqttService,
    MqttProvider
  ]
})
export class AppModule {}
