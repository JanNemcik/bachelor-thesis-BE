import { GatewayService } from './service/gateway.service';
import { Controller, Get, UsePipes } from '@nestjs/common';
import { AppService } from './service/app.service';
import { Client, ClientProxy, MessagePattern } from '@nestjs/microservices';
import { Observable, of, interval } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { MqttMessageValidationPipe } from './config/mqtt-message-validation.pipe';
import { SensorNodeType, HandshakeTypeEnum } from './data/interfaces';
import { MqttService } from './service/mqtt.service';

@Controller()
export class AppController {
  constructor(
    private appService: AppService,
    private readonly gatewayService: GatewayService,
    private mqttService: MqttService
  ) {}

  // TODO: use with custom mqtt implementation
  @UsePipes(MqttMessageValidationPipe)
  @MessagePattern('data')
  saveData(data: any) {
    return this.appService.storeData(data).pipe(
      tap(broadcastData => {
        console.log('broadcast', broadcastData);
        this.gatewayService.brodcastData(broadcastData, 'update_data');
      })
    );
  }
}
