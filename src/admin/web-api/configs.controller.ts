import {
  Controller,
  UsePipes,
  Get,
  Patch,
  Body,
  HttpCode,
  Delete,
  Param
} from '@nestjs/common';
import { MessagePattern, Client, ClientProxy } from '@nestjs/microservices';
import { ConfigsService } from '../service/configs.service';
import { MqttMessageValidationPipe } from '../../config/mqtt-message-validation.pipe';
import { MQTT_CLIENT_OPTIONS } from 'src/config';
import { MqttNodeConfigRequest, MqttNodeConfig } from '../data';
import { Observable } from 'rxjs';
import { PatternEnum, NodeDeviceTypeEnum } from 'src/data/interfaces';

@Controller('config')
export class ConfigsController {
  @Client(MQTT_CLIENT_OPTIONS)
  client: ClientProxy;
  constructor(private configsService: ConfigsService) {}

  /**
   * Pushes requested config to network
   * @param {MqttNodeConfigRequest} configRequest
   * @memberof ConfigsController
   */
  @UsePipes(MqttMessageValidationPipe)
  @MessagePattern('config')
  getConfigForNetwork(configRequest: MqttNodeConfigRequest) {
    console.log('config request: ', configRequest);
    const config = this.configsService.getConfigForNetwork(configRequest);
    return this.pushConfigToNetwork(PatternEnum.CONFIG, config);
  }

  private pushConfigToNetwork(
    pattern: string,
    config: MqttNodeConfig
  ): Observable<any> {
    return this.client.send(pattern, config);
  }

  @Patch('store')
  @HttpCode(200)
  storeConfig(@Body() config: MqttNodeConfigRequest) {
    return this.configsService.storeConfig(config);
  }

  @Patch('create')
  @HttpCode(201)
  createConfig(@Body() config: MqttNodeConfig) {
    return this.configsService.createConfig(config);
  }

  @Patch('patch')
  @HttpCode(200)
  patchConfig(@Body() config: MqttNodeConfig) {
    return this.configsService.patchConfig(config);
  }

  @Delete('delete/:id')
  @HttpCode(200)
  deleteConfig(@Param('id') nodeId: number) {
    return this.configsService.deleteConfig(nodeId);
  }

  @Get('')
  @HttpCode(200)
  getAllConfigs(@Param('type') type: NodeDeviceTypeEnum) {
    return this.configsService.getAllConfigs(type);
  }

  @Get(':id')
  @HttpCode(200)
  getNodeConfig(@Param('id') nodeId: number) {
    this.configsService.getNodeConfig(nodeId);
  }
}
