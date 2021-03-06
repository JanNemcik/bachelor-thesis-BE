import { Controller, Get, UsePipes } from '@nestjs/common';
import { AppService } from './app.service';
import { Client, ClientProxy, MessagePattern } from '@nestjs/microservices';
import { Observable, of, interval } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { MQTT_CLIENT_OPTIONS } from './config';
import { MqttMessage } from './data/interfaces';
import { MqttMessageValidationPipe } from './config/mqtt-message-validation.pipe';

@Controller()
export class AppController {
  @Client(MQTT_CLIENT_OPTIONS)
  client: ClientProxy;
  constructor(private readonly appService: AppService) {}

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
    return this.appService.storeData(data);
  }
}
