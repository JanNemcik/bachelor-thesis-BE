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
  Query,
  Post
} from '@nestjs/common';
import { MessagePattern, Client, ClientProxy } from '@nestjs/microservices';
import { ConfigsService } from '../service/configs.service';
import { MqttMessageValidationPipe } from '../../config/mqtt-message-validation.pipe';
import { Observable } from 'rxjs';
import {
  PatternEnum,
  NodeDeviceTypeEnum,
  MqttNodeConfigRequest,
  MqttNodeConfig
} from '../../data/interfaces';

@Controller('config')
export class ConfigsController {
  constructor(private configsService: ConfigsService) {}

  /**
   * Pushes requested config to network
   * @param {MqttNodeConfigRequest} configRequest
   * @memberof ConfigsController
   */
  @UsePipes(MqttMessageValidationPipe)
  getConfigForNetwork(configRequest: MqttNodeConfigRequest) {
    console.log('config request: ', configRequest);
    const config = this.configsService.getConfigForNetwork(configRequest);
    return this.pushConfigToNetwork(PatternEnum.CONFIG, config);
  }

  private pushConfigToNetwork(
    pattern: string,
    config: MqttNodeConfig
  ): Observable<any> {
    return;
    // return this.client.send(pattern, config);
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

  @Post('create')
  @HttpCode(201)
  createConfig(@Body() config: MqttNodeConfig) {
    console.log(config);
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
