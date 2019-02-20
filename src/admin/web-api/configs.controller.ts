import {
  Controller,
  UsePipes,
  Get,
  Patch,
  Body,
  HttpCode,
  Delete,
  Param,
  Req,
  Query
} from '@nestjs/common';
import { MessagePattern, Client, ClientProxy } from '@nestjs/microservices';
import { ConfigsService } from '../service/configs.service';
import { MqttMessageValidationPipe } from '../../config/mqtt-message-validation.pipe';
import { MqttNodeConfigRequest, MqttNodeConfig } from '../data';
import { Observable } from 'rxjs';
import { PatternEnum, NodeDeviceTypeEnum } from '../../data/interfaces';
import { MQTT_CLIENT_OPTIONS } from '../../shared';

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

  @Get('')
  get() {
    return 'ssdsddsd';
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

  @Delete('delete/:type')
  @HttpCode(200)
  deleteConfig(@Param('type') nodeType: NodeDeviceTypeEnum) {
    return this.configsService.deleteConfig(nodeType);
  }

  @Get('collection')
  @HttpCode(200)
  getAllConfigs(@Query('type') type: NodeDeviceTypeEnum) {
    return this.configsService.getAllConfigs(type);
  }

  @Get(':id')
  @HttpCode(200)
  getNodeConfig(@Param('id') nodeId: number) {
    this.configsService.getNodeConfig(nodeId);
  }
}
