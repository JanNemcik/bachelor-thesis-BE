import { Injectable } from '@nestjs/common';
import { Observable, of, throwError, from, Subject, pipe, EMPTY } from 'rxjs';
import * as _ from 'lodash';
import {
  mergeMap,
  map,
  filter,
  retry,
  catchError,
  timeout,
  take,
  mapTo
} from 'rxjs/operators';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LogModel } from '../data';
import { storeToDB } from 'src/shared';
import { MqttProvider } from './mqtt.provider';
import {
  MqttMessage,
  HandshakeTypeEnum,
  MqttLogManager
} from '../data/interfaces';
import { LogStateEnum, LogStatusEnum } from '../data/interfaces/enum/log.enum';
import { AppService } from './app.service';

@Injectable()
export class MqttService {
  private messagesQueue = new Map<string, MqttMessage>();
  // TODO: todo below
  // /**
  //  * @key topic: topic, to which are subsribers registred
  //  * @value {
  //  * @param {AppService.hash()} id
  //  * @function fn: function to be executed
  //  *        }
  //  * @private
  //  * @memberof MqttService
  //  */
  // private subscribers = new Map<
  //   string,
  //   Array<{ id: string; fn: (message: any) => any }>
  // >();

  constructor(
    @InjectModel('LogModel') private readonly logModel: Model<LogModel>,
    private readonly mqttProvider: MqttProvider,
    private appService: AppService
  ) {}

  /**
   *
   * @param topic
   * @param message
   */
  publishMessage<T = any>(topic: string, message: T): Observable<any> {
    // mqttProvider starts synchronization proccess with network and handles publishing of data to the network
    let hash: string;

    const synAckReceived = item =>
      item.hash === hash && item.state === HandshakeTypeEnum.SYN_ACK;

    const ackReceived = item =>
      item.hash === hash && item.state === HandshakeTypeEnum.ACK;

    const conditionObservable = (condition: (...args) => boolean) =>
      this.mqttProvider.syncMessageProcesses$.pipe(
        mergeMap(messages => from(messages)),
        filter(value => condition(value))
      );

    return of(null).pipe(
      this.mqttProvider.startSyncProcess<T>(topic, message),
      // creates log record
      map(createdHash => {
        hash = createdHash;
        return {
          hash: createdHash,
          topic,
          state: LogStateEnum.PENDING,
          status: LogStatusEnum.PUBLISHING
        };
      }),
      // creating log with state pending
      storeToDB<LogModel>(this.logModel),
      // wait for syn-ack, every 2 seconds new attempt; after 3 attempts err;
      this.retryPublishMechanism(
        conditionObservable(synAckReceived),
        conditionObservable(ackReceived)
      )
    );
  }

  // private pushToMessages(message: MqttMessage) {
  //   this.messagesQueue.set(message.hash, message);
  // }

  // private popFromMessages(message: MqttMessage, wasSuccessful: boolean) {
  //   this.storeMessageLog(message, wasSuccessful).pipe(
  //     tap(() => this.messagesQueue.delete(message.hash))
  //   );
  // }

  // private storeMessageLog(message: MqttMessage, wasSuccessful: boolean) {
  //   return pipe(
  //     map(() =>
  //       createInstance<LogModel>(this.logModel, { ...message, wasSuccessful })
  //     ),
  //     mergeMap(createdDocument => from(createdDocument.save()))
  //   );
  // }

  // TODO: future possibilities to dynamically register subscriber function
  // for specified topic, ex. you can send topic and function from client to
  // react on messages from netwrok
  // registerSubsriber(
  //   topic: string,
  //   subscriber: { id: string; fn: (mess: any) => any }
  // ) {
  //   const currentValue = this.subscribers.get(topic) || [];
  //   this.subscribers.set(topic, [...currentValue, subscriber]);
  // }

  // unregisterSubscriber(topic: string, functionId: string) {
  //   const topicSubscribers = this.subscribers.get(topic);
  //   const filteredSubscribers = topicSubscribers.filter(
  //     message => message.id !== functionId
  //   );
  //   this.subscribers.set(topic, filteredSubscribers);
  // }

  /**
   *
   *
   * @private
   * @memberof MqttService
   */
  private retryPublishMechanism = (
    obs1: Observable<any> | Subject<any>,
    obs2: Observable<any> | Subject<any>
  ) =>
    pipe(
      mergeMap((doc: LogModel) =>
        obs1.pipe(
          timeout(2000),
          catchError(err => {
            this.mqttProvider.repeatSyncProcess(doc.topic, doc.hash);
            return throwError({ err, doc });
          }),
          retry(2),
          take(1),
          mapTo(doc)
        )
      ),
      catchError((errorManager: MqttLogManager) =>
        this.updateLog(errorManager, LogStateEnum.ERRORED)
      ),
      mergeMap((doc: LogModel) =>
        obs2.pipe(
          timeout(2000),
          catchError(err => {
            // TODO: consider a solution what to do if data is not received
            this.mqttProvider.repeatSyncProcess(doc.topic, doc.hash);
            return throwError({ err, doc });
          }),
          retry(2),
          take(1),
          mergeMap(() => this.updateLog({ doc }, LogStateEnum.SUCCESSFUL)),
          mapTo(LogStateEnum.SUCCESSFUL)
        )
      ),
      catchError((errorManager: MqttLogManager) =>
        this.updateLog(errorManager, LogStateEnum.ERRORED).pipe(
          mapTo(LogStateEnum.ERRORED)
        )
      )
    );

  /**
   *
   *
   * @private
   * @param {LogModel} doc
   * @param {LogStateEnum} state
   * @returns
   * @memberof MqttService
   */
  private updateLog({ err, doc }: MqttLogManager, state: LogStateEnum) {
    doc.state = state;
    doc.err = err;
    return from(doc.save());
  }
}
