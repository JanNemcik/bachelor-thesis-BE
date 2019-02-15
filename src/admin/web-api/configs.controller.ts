import { Controller, UsePipes } from '@nestjs/common';
import { MessagePattern, Client, ClientProxy } from '@nestjs/microservices';
import { ConfigsService } from '../service/configs.service';
import { MqttMessageValidationPipe } from '../../config/mqtt-message-validation.pipe';
import { MQTT_CLIENT_OPTIONS } from 'src/config';
import { MqttResponseType } from 'src/data/interfaces';

@Controller()
export class ConfigsController {
  @Client(MQTT_CLIENT_OPTIONS)
  client: ClientProxy;
  constructor(private configsService: ConfigsService) {}

  @UsePipes(MqttMessageValidationPipe)
  @MessagePattern('datax')
  saveData(data: MqttResponseType) {
    console.log('data2', data);
  }
}
