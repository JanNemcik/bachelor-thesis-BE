import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LOG_SCHEMA, DATA_SCHEMA } from '../data';
import { MqttProvider } from '../service/mqtt.provider';
import { MqttService } from '../service/mqtt.service';
import { EventsGateway } from '../config/events.gateway';
import { GatewayService } from '../service/gateway.service';
import { AppService } from '../service/app.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'LogsModel', schema: LOG_SCHEMA, collection: 'logs' },
      { name: 'DataModel', schema: DATA_SCHEMA, collection: 'data' }
    ])
  ],
  providers: [
    GatewayService,
    EventsGateway,
    MqttService,
    MqttProvider,
    AppService
  ],
  exports: [MqttService, AppService, GatewayService]
})
export class SharedModule {}
