import { Module } from '@nestjs/common';
import { MqttProvider } from '../service/mqtt.provider';
import { MqttService } from '../service/mqtt.service';
import { EventsGateway } from '../config/events.gateway';
import { GatewayService } from '../service/gateway.service';
import { AppService } from '../service/app.service';
import { ConfigsService } from '../admin/service/configs.service';
import { DatabaseModule } from '../database/database.module';
import { NodesService } from '../admin/service/nodes.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    GatewayService,
    EventsGateway,
    MqttService,
    MqttProvider,
    AppService,
    ConfigsService,
    NodesService
  ],
  exports: [MqttService, AppService, GatewayService]
})
export class SharedModule {}
