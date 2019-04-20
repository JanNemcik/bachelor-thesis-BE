import {
  Controller,
  Get,
  Patch,
  Body,
  HttpCode,
  Delete,
  Param,
  Query,
  Post
} from '@nestjs/common';
import { ConfigsService } from '../service/configs.service';
import {
  NodeDeviceTypeEnum,
  MqttNodeConfigRequest,
  NodeConfig
} from '../../data/interfaces';

@Controller('config')
export class ConfigsController {
  constructor(private configsService: ConfigsService) {}

  @Patch('store')
  @HttpCode(200)
  storeConfig(@Body() config: MqttNodeConfigRequest) {
    return this.configsService.storeConfig(config);
  }

  @Post('create')
  @HttpCode(201)
  createConfig(@Body() config: NodeConfig) {
    return this.configsService.createConfig(config);
  }

  @Patch('patch/:id')
  @HttpCode(200)
  patchConfig(@Param('id') id: string) {
    return this.configsService.updateCurrentConfig(id);
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
  getNodeConfigs(@Param('id') id: string) {
    return this.configsService.getNodeConfigs(id);
  }
}
