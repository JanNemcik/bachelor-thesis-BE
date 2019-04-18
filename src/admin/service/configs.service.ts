import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  NodeDeviceTypeEnum,
  MqttNodeConfig,
  MqttNodeConfigRequest
} from '../../data/interfaces';
import { from, Observable, of } from 'rxjs';
import * as _ from 'lodash';
import { take, catchError, mergeMap } from 'rxjs/operators';
import { transformFromSchemaToModel } from '../../shared/pipeables';
import { ConfigsModel } from '../data';
import { createInstance } from '../../shared';

@Injectable()
export class ConfigsService {
  constructor(
    @InjectModel('ConfigsModel')
    private readonly configsModel: Model<ConfigsModel>
  ) {}

  /**
   * Stores config, requested directly from network
   * @param config config object
   */
  storeConfig(config: MqttNodeConfigRequest) {}

  /**
   * Creates new configinterval
   * @param config config object
   */
  createConfig(config: MqttNodeConfig) {
    const { configReq, ...toStore } = config;
    return of(createInstance<ConfigsModel>(this.configsModel, toStore)).pipe(
      mergeMap(createdConfig => from(createdConfig.save())),
      catchError(err => of(err))
    );
  }

  /**
   * Updates config
   * @param config updated config
   */
  patchConfig(config: MqttNodeConfig) {}

  /**
   * TODO: here should probably type
   * Deletes config by node id
   * @param nodeId node id
   */
  deleteConfig(nodeType: NodeDeviceTypeEnum) {}

  /**
   * Gets all configs for requested node type
   * @param nodeType node type
   */
  getAllConfigs(nodeType: NodeDeviceTypeEnum): Observable<any[] | any> {
    return from(
      this.configsModel
        .find({ node_type: nodeType })
        .lean()
        .exec()
    ).pipe(
      transformFromSchemaToModel(),
      take(1)
    );
  }

  getNodeConfig(nodeId: number): MqttNodeConfig {
    return;
  }

  /**
   * Returns config requested by network
   * @param config requeted config
   */
  getConfigForNetwork(config: MqttNodeConfigRequest): MqttNodeConfig {
    return;
  }
}
