import { createInstance, transformFromSchemaToModel } from '../shared';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DataModel, LogModel } from '../data';
import { of, from, throwError } from 'rxjs';
import { mergeMap, catchError, map, take, toArray } from 'rxjs/operators';
import { LogStatusEnum } from '../data/interfaces';
import { getLogStateEnumName } from '../data/model';

@Injectable()
export class AppService {
  constructor(
    @InjectModel('DataModel') private readonly dataModel: Model<DataModel>,
    @InjectModel('LogsModel') private readonly logsModel: Model<LogModel>
  ) {}

  storeData(data: any) {
    return of(createInstance<DataModel>(this.dataModel, data)).pipe(
      mergeMap(createdDocument => from(createdDocument.save())),
      // doing some transformation with the data and error handling
      map(storedData => {
        if (!!!storedData) {
          throw new BadRequestException(`Data wasn't stored properly`);
        }
        return storedData;
      }),
      catchError(err => throwError(err))
    );
  }

  getLogs() {
    return from(
      this.logsModel
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
}
