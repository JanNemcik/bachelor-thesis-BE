import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DataModel } from '../data';
import { MqttMessage, BroadcastDataDto } from '../data/interfaces';
import { createInstance } from '../config';
import { of, from, throwError } from 'rxjs';
import { mergeMap, catchError, map, tap } from 'rxjs/operators';
import { GatewayService } from './gateway.service';

@Injectable()
export class AppService {
  constructor(
    @InjectModel('DataModel') private readonly dataModel: Model<DataModel>,
    private gatewayService: GatewayService
  ) {}

  storeData(data: MqttMessage) {
    return of(createInstance<DataModel>(this.dataModel, data)).pipe(
      mergeMap(createdDocument => from(createdDocument.save())),
      // doing some transformation with the data and error handling
      map<DataModel, BroadcastDataDto>(storedData => {
        if (!!!storedData) {
          throw new BadRequestException(`Data wasn't stored properly`);
        }
        return storedData;
      }),
      tap(broadcastData => {
        this.gatewayService.brodcastData(broadcastData, 'update_data');
      }),
      catchError(err => throwError(err))
    );
  }
}
