import { GatewayService } from './service/gateway.service';
import { Controller, Get, UsePipes } from '@nestjs/common';
import { AppService } from './service/app.service';
import { Client, ClientProxy, MessagePattern } from '@nestjs/microservices';
import { Observable, of, interval } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { MQTT_CLIENT_OPTIONS } from './config';
import { MqttMessage } from './data/interfaces';
import { MqttMessageValidationPipe } from './config/mqtt-message-validation.pipe';

@Controller()
export class AppController {
  @Client(MQTT_CLIENT_OPTIONS)
  client: ClientProxy;
  constructor(
    private readonly appService: AppService,
    private gatewayService: GatewayService
  ) {}

  @Get()
  call(): Observable<number> {
    const pattern = 'post';
    const data = [1, 2, 3, 4, 5];
    interval(10000)
      .pipe(mergeMap(() => this.client.send<number>(pattern, data)))
      .subscribe();
    return of();
  }

  @UsePipes(MqttMessageValidationPipe)
  @MessagePattern('data')
  saveData(data: MqttMessage) {
    return this.appService.storeData(data).pipe(
      tap(broadcastData => {
        console.log('broadcast', broadcastData);
        this.gatewayService.brodcastData(broadcastData, 'update_data');
      })
    );
  }
}
