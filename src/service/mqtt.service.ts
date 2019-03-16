import { HandshakeTypeEnum } from './../data/interfaces/enum/handshake.enum';
import { Injectable } from '@nestjs/common';
import * as crypto_js from 'crypto-js';
import { Observable, from, of, pipe } from 'rxjs';
import * as _ from 'lodash';
import {
  tap,
  mergeMap,
  skipWhile,
  takeWhile,
  takeUntil,
  map,
  skipUntil
} from 'rxjs/operators';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LogsModel } from '../data';
import { createInstance } from 'src/shared';
import { MqttProvider } from './mqtt.provider';
import { MqttMessage, MqttMessageWrapper } from '../data/interfaces';

@Injectable()
export class MqttService {
  private messagesQueue = new Map<string, MqttMessage>();
  private subscribers = new Map<
    string,
    Array<{ id: number; fn: (message: any) => any }>
  >();

  constructor(
    @InjectModel('LogsModel') private readonly logsModel: Model<LogsModel>,
    private readonly mqttProvider: MqttProvider
  ) {}

  encryptMessage<T = any>(data: T, handShakeType: HandshakeTypeEnum): string {
    const message = JSON.stringify({
      data,
      hash: crypto_js.SHA256(JSON.stringify(data)).toString(),
      handshake: handShakeType
    });

    return;
  }

  /**
   * 
   * @param topic 
   * @param message 
   */
  publishMessage(topic: string, message: any): Observable<any> {
    // mqttProvider starts synchronization proccess with network and handles publishing of data to the network
    return of(null).pipe(this.mqttProvider.startSyncProcess(topic, message));
  }

  private pushToMessages(message: MqttMessage) {
    this.messagesQueue.set(message.hash, message);
  }

  private popFromMessages(message: MqttMessage, wasSuccessful: boolean) {
    this.storeMessageLog(message, wasSuccessful).pipe(
      tap(() => this.messagesQueue.delete(message.hash))
    );
  }

  private storeMessageLog(
    message: MqttMessage,
    wasSuccessful: boolean
  ): Observable<any> {
    return of(
      createInstance<LogsModel>(this.logsModel, { ...message, wasSuccessful })
    ).pipe(mergeMap(createdDocument => from(createdDocument.save())));
  }

  registerSubsriber(topic, subscriber) {
    this.subscribers.set(topic, subscriber);
  }

  unregisterSubscriber(topic: string, functionId: number) {
    const topicSubscribers = this.subscribers.get(topic);
    const filteredSubscribers = topicSubscribers.filter(
      message => message.id !== functionId
    );
    this.subscribers.set(topic, filteredSubscribers);
  }
}
