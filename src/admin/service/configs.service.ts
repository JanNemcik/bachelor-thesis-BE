import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  NodeDeviceTypeEnum,
  MqttNodeConfigRequest,
  NodeConfig,
  MqttNodeConfigResponse,
  TopicEnum
} from '../../data/interfaces';
import { from, Observable, of, throwError } from 'rxjs';
import * as _ from 'lodash';
import {
  take,
  catchError,
  mergeMap,
  map,
  tap,
  mapTo,
  filter
} from 'rxjs/operators';
import {
  transformFromSchemaToModel,
  transformFromModelToSchema
} from '../../shared/pipeables';
import { ConfigsModel } from '../data';
import { createInstance } from '../../shared';
import { NodesService } from './nodes.service';
import { MqttService } from '../../service/mqtt.service';

@Injectable()
export class ConfigsService {
  constructor(
    @InjectModel('ConfigsModel')
    private readonly configsModel: Model<ConfigsModel>,
    private nodesService: NodesService,
    private mqttService: MqttService
  ) {
    this.mqttService.mqttPublishSubject
      .pipe(filter(publish => publish.topic === TopicEnum.CONFIG))
      .subscribe({
        next: ({ topic, value }) => {
          let data: any;
          this.mqttService.sendMessageToNetwork(topic, data);
        }
      });
  }

  /**
   * Stores config, requested directly from network
   * @param config config object
   */
  storeConfig(config: MqttNodeConfigRequest) {}

  /**
   * Creates new configinterval
   * @param config config object
   */
  createConfig(config: NodeConfig) {
    const toStore = { ...config, createdAt: new Date(), isCurrent: true };
    return of(toStore).pipe(
      transformFromModelToSchema(),
      map(transformed =>
        createInstance<ConfigsModel>(this.configsModel, transformed)
      ),
      mergeMap(createdConfig =>
        from(createdConfig.save()).pipe(
          mergeMap((confModel: any) =>
            from(
              this.configsModel
                .findOneAndUpdate(
                  {
                    is_current: true,
                    node_id: confModel.node_id,
                    created_at: { $ne: confModel.created_at }
                  },
                  { is_current: false },
                  { new: true }
                )
                .exec()
            ).pipe(mapTo(confModel))
          )
        )
      ),
      tap(() =>
        this.mqttService.sendMessageToNetwork(TopicEnum.CONFIG, {
          configReq: false,
          ...config
        })
      ),
      catchError(err => {
        console.error(err, ' | ', new Date().toLocaleTimeString());
        return throwError(new BadRequestException(err));
      })
    );
  }

  /**
   * Updates config
   * @param config updated config
   */
  updateCurrentConfig(objectId: string) {
    return from(
      this.configsModel
        .findByIdAndUpdate(objectId, { is_current: true }, { new: true })
        .lean()
        .exec()
    ).pipe(
      mergeMap(res =>
        from(
          this.configsModel
            .findOneAndUpdate(
              {
                _id: { $ne: res._id },
                is_current: true,
                node_id: res.node_id
              },
              { is_current: false }
            )
            .exec()
        ).pipe(mapTo(res))
      ),
      tap(({ node_id, interval, node_type }) => {
        this.mqttService.sendMessageToNetwork(TopicEnum.CONFIG, {
          configReq: false,
          node_id,
          interval,
          node_type
        });
      }),
      catchError(err => {
        console.error(err, ' | ', new Date().toLocaleTimeString());
        return throwError(new BadRequestException(err));
      })
    );
  }

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
        .where({ is_current: true })
        .lean()
        .exec()
    ).pipe(
      transformFromSchemaToModel(),
      // map((result: ConfigsModel[]) =>
      //   result.sort(
      //     (first, second) =>
      //       second.createdAt.getTime() - first.createdAt.getTime()
      //   )
      // ),
      // map(sorted =>
      //   [...new Set(sorted.map(i => i.nodeId))].map(node =>
      //     sorted.find(i => i.nodeId === node)
      //   )
      // ),

      take(1)
    );
  }

  getNodeConfigs(objectId: string): Observable<any[]> {
    return this.nodesService.getNodeByObjectId(objectId).pipe(
      map(([res]) => res),
      mergeMap(({ nodeId }) =>
        this.configsModel
          .find({ node_id: nodeId })
          .where({ is_current: false })
          .lean()
          .exec()
      ),
      transformFromSchemaToModel(),
      // map((result: ConfigsModel[]) =>
      //   result
      //     .sort(
      //       (first, second) =>
      //         second.createdAt.getTime() - first.createdAt.getTime()
      //     )
      //     .slice(1)
      // ),
      take(1)
    );
  }

  /**
   * Returns config requested by network
   * @param config requeted config
   */
  getConfigForNetwork(nodeId: string): MqttNodeConfigResponse {
    return;
  }
}
