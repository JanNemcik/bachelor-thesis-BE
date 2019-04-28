import { createInstance, transformFromSchemaToModel } from '../shared';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DataModel, LogModel } from '../data';
import { of, from, throwError } from 'rxjs';
import { mergeMap, catchError, map, take, toArray, tap } from 'rxjs/operators';
import { LogStatusEnum } from '../data/interfaces';
import { getLogStateEnumName } from '../data/model';
import { GatewayService } from './gateway.service';

@Injectable()
export class AppService {
  constructor(
    @InjectModel('DataModel') private readonly dataModel: Model<DataModel>,
    @InjectModel('LogsModel') private readonly logModel: Model<LogModel>,
    private gatewayService: GatewayService
  ) {}

  storeData(data: any) {
    console.log('data', data);
    return of(createInstance<DataModel>(this.dataModel, data)).pipe(
      mergeMap(createdDocument => from(createdDocument.save())),
      // doing some transformation with the data and error handling
      tap(storedData => {
        if (!!!storedData) {
          throw new BadRequestException(`Data wasn't stored properly`);
        } else {
          console.log('broadcasting', data);
          const { node_id, node_type, timestamp, ...rest } = data;
          data = {
            nodeId: node_id,
            type: node_type,
            timestamp,
            value: { ...rest }
          };
          this.gatewayService.brodcastData(data, 'data');
        }
      }),
      catchError(err => throwError(err))
    );
  }

  getLogs() {
    return from(
      this.logModel
        .find()
        .lean()
        .exec()
    ).pipe(
      transformFromSchemaToModel(),
      map((result: any[]) =>
        result.sort((first, second) => second.timestamp - first.timestamp)
      ),
      mergeMap(res => from(res)),
      map(({ state, status, ...rest }) => ({
        ...rest,
        state: getLogStateEnumName(state),
        status:
          status &&
          (status === LogStatusEnum.PUBLISHING ? 'Publishing' : 'Receiving')
      })),
      toArray(),
      take(1),
      catchError(err => throwError(err))
    );
  }

  logAttacker(nodeId: string) {}

  getData() {
    // db.collection.aggregate([
    //   { "$sort": { "user": 1, "_id": -1 } },
    //   {
    //     "$group": {
    //       "_id": "$user",
    //       "user": { "$last": "$$ROOT" }
    //     }
    //   }
    // ])
    return of(
      this.dataModel
        .aggregate()
        .sort({ timestamp: 'desc' })
        .group({
          node_id: '$node_id',
          timestamp: { $last: '$$ROOT' }
        })
        .exec()
    ).pipe(
      transformFromSchemaToModel(),
      take(1),
      catchError(err => {
        console.error(err, new Date().toLocaleTimeString());
        return of(null);
      })
    );
  }
}
