import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  NodeDeviceTypeEnum,
  MqttNodeConfig,
  MqttNodeConfigRequest
} from '../../data/interfaces';
import { from, Observable, of, throwError } from 'rxjs';
import * as _ from 'lodash';
import { take, catchError, mergeMap, map } from 'rxjs/operators';
import {
  transformFromSchemaToModel,
  transformFromModelToSchema
} from '../../shared/pipeables';
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
    const toStore = { ...config, createdAt: new Date() };
    return of(toStore).pipe(
      transformFromModelToSchema(),
      map(transformed =>
        createInstance<ConfigsModel>(this.configsModel, transformed)
      ),
      mergeMap(createdConfig => from(createdConfig.save())),
      catchError(err => {
        console.error(err);
        return throwError(new BadRequestException(err));
      })
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
