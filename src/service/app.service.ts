import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DataModel } from '../data';
import { of, from, throwError } from 'rxjs';
import { mergeMap, catchError, map, tap } from 'rxjs/operators';
import { GatewayService } from './gateway.service';
import { createInstance } from 'src/shared';

@Injectable()
export class AppService {
  constructor(
    @InjectModel('DataModel') private readonly dataModel: Model<DataModel>,
    private gatewayService: GatewayService
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
}
