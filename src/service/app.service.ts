import { createInstance, MQTT_MESSAGE_PSK } from '../shared';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DataModel } from '../data';
import { of, from, throwError } from 'rxjs';
import { mergeMap, catchError, map, tap } from 'rxjs/operators';
import { GatewayService } from './gateway.service';
import * as crypto_js from 'crypto-js';

@Injectable()
export class AppService {
  constructor(
    @InjectModel('DataModel') private readonly dataModel: Model<DataModel>
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

  /**
   * Encrypts given message
   * @param message
   */
  encryptMessage(message: string): string {
    return crypto_js.AES.encrypt(
      message,
      MQTT_MESSAGE_PSK,
      crypto_js.TripleDES
    ).toString();
  }

  /**
   * Decryptes given message
   * @param message
   */
  decryptMessage(message: string): string {
    return crypto_js.AES.decrypt(
      message,
      MQTT_MESSAGE_PSK,
      crypto_js.TripleDES
    ).toString(crypto_js.enc.Utf8);
  }

  /**
   * Return hashed string of length 10
   * @param toHash
   */
  createHashedId = (toHash): string =>
    crypto_js
      .SHA256(JSON.stringify(toHash))
      .toString()
      .substr(0, 10);
}
