import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigsModel, MqttNodeConfigRequest, MqttNodeConfig } from '../data';
import { NodeDeviceTypeEnum } from 'src/data/interfaces';

@Injectable()
export class ConfigsService {
  constructor(
    @InjectModel('ConfigsModel')
    private readonly configsModel: Model<ConfigsModel>
  ) {}

  storeConfig(config: MqttNodeConfigRequest) {}

  createConfig(config: MqttNodeConfig) {}

  patchConfig(config: MqttNodeConfig) {}

  deleteConfig(nodeId: number) {}

  getAllConfigs<T = NodeDeviceTypeEnum>(type: T): T[] {
    return;
  }

  getNodeConfig(nodeId: number): MqttNodeConfig {
    return;
  }

  getConfigForNetwork(config: MqttNodeConfigRequest): MqttNodeConfig {
    return;
  }
}
