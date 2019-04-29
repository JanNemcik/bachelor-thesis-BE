import { MQTT_CLIENT_OPTIONS } from '../shared/constants';
import { Injectable } from '@nestjs/common';
import mqtt = require('mqtt');
import * as _ from 'lodash';
import {
  MqttSignalingMessage,
  MqttResponse,
  MqttData,
  HandshakeTypeEnum,
  TopicEnum,
  PublisherEnum
} from '../data/interfaces';
import { pipe, BehaviorSubject, of, ReplaySubject } from 'rxjs';
import { map, share, take, mergeMap } from 'rxjs/operators';
import { AppService } from './app.service';
import {
  encryptMessage,
  decryptMessage,
  validateMessage,
  createHashedId
} from '../shared/helpers';

const date = new Date();

console.info(
  '[MQTT Provider] - ',
  date.toLocaleDateString(),
  date.toLocaleTimeString(),
  ': Initializing MQTT Provider ....'
);

@Injectable()
export class MqttProvider {
  private readonly _client: mqtt.MqttClient;
  // stores currently processing messages
  private processingMessages: Map<string, MqttData> = new Map();
  // subject for network synchronization handling
  private _syncMessageProcessing$ = new BehaviorSubject<
    Array<{ hash: string; state: HandshakeTypeEnum }>
  >([]);

  private allowReceiving = true;
  private attackerId: string = null;

  private sharedMessagesProcessing = this._syncMessageProcessing$
    .asObservable()
    .pipe(share());

  // value of network synchronization handling subject
  private processingMessagesValue: Array<{
    hash: string;
    state: HandshakeTypeEnum;
  }>;

  public get syncMessageProcessing$() {
    return this.sharedMessagesProcessing;
  }

  private publishSubject = new ReplaySubject<{ topic: TopicEnum; value?: any }>(
    1
  );

  public publishSubject$ = this.publishSubject.asObservable().pipe(share());

  private startTime;
  private endTime;

  constructor(private appService: AppService) {
    console.info(
      '[MQTT Provider] - ',
      date.toLocaleDateString(),
      date.toLocaleTimeString(),
      ': MQTT Provider initialized'
    );

    this._client = mqtt.connect(MQTT_CLIENT_OPTIONS);

    this._client.on('connect', () => {
      this.init();
    });
    this.processingMessagesValue = this._syncMessageProcessing$.value;
  }

  /**
   * Checks the receiving availabilty of the network
   */
  startSyncProcess(topic: TopicEnum, data: any) {
    // send {type: syn} to the network
    this.startTime = Date.now();
    console.log('start syn process', data);
    console.log('start', this.startTime);
    return pipe(map(() => this.sendSyn(data, topic)));
  }

  /**
   *
   *
   * @private
   * @memberof MqttProvider
   */
  private init() {
    this._client.subscribe('#').on('message', (topic: TopicEnum, message) => {
      const receivedMessage = message.toString();
      console.log('received', receivedMessage);
      // when a message arrives, do something with it
      try {
        // const decryptedMessage = JSON.parse(
        //   decryptMessage(receivedMessage)
        // ) as MqttResponse;
        const decryptedMessage = JSON.parse(receivedMessage);
        if (
          decryptedMessage.publisher === PublisherEnum.NETWORK &&
          this.allowReceiving
        ) {
          if (this.isSignalingMqttMessage(decryptedMessage)) {
            const { handshake } = decryptedMessage;
            switch (handshake) {
              case HandshakeTypeEnum.SYN_ACK:
                this.handleIncomingSynAck(decryptedMessage.hash, topic);
                break;
              case HandshakeTypeEnum.ACK:
                this.handleIncomingAck(decryptedMessage.hash);
                break;
              default:
                // log error
                break;
            }
          } else {
            const { data, nodeId } = decryptedMessage;
            // do stuff with data
            const validatedData = validateMessage(data);
            if (typeof validatedData === 'string') {
              // place to get all ledgers and recognize the attacker
              // validated data is nodeId of attacker

              this.allowReceiving = false;
              this.attackerId = nodeId;
              this.publishData({ req: true }, TopicEnum.LEDGER);
            } else {
              const { id, publisher, type, ...data } = decryptedMessage;
              const toStore = { node_id: id, node_type: type, ...data };
              // 80:7d:3a:86:9d:80

              this.processIncommingRequest(topic, toStore);
            }
          }
        } else if (
          decryptedMessage.publisher === PublisherEnum.NETWORK &&
          topic === TopicEnum.LEDGER &&
          this.attackerId
        ) {
          const { data } = decryptedMessage;
          const ledger = (data as string[])
            .map(a => a.split(';').slice(1, 2))
            .map(it => ({ ip: it[0], mac: it[1] }))
            .find(led => led.mac === this.attackerId);
          const attackerObject = {
            node_id: this.attackerId,
            ip_addr: ledger.ip
          };
          const attackerMessage = encryptMessage(
            JSON.stringify(attackerObject)
          );
          this.publishData(attackerMessage, TopicEnum.ATTACKER);
          this.appService.logAttacker(this.attackerId);
          this.attackerId = null;
          this.allowReceiving = true;
        }
      } catch (e) {
        console.error(e, ' | ', new Date().toLocaleTimeString());
        const parsed = JSON.parse(receivedMessage);
        console.log('parsed', parsed);
        const { id, publisher, type, ...data } = parsed;
        const toStore = { node_id: id, node_type: type, ...data };
        // 80:7d:3a:86:9d:80
        of(toStore)
          .pipe(
            mergeMap(d => this.appService.storeData(d)),
            take(1)
          )
          .subscribe();
      }
    });
  }

  /**
   *
   *
   * @private
   * @param {string} hash
   * @memberof MqttProvider
   */
  private handleIncomingAck(hash: string) {
    this.processingMessages.delete(hash);
    // first emit to subscribers
    this.changeState(hash, HandshakeTypeEnum.ACK);
    // then remove without emiting
    this.removeFromProcessingMessagesSubject(hash);
    this.endTime = Date.now();

    console.log('end', this.endTime, 'diff: ', this.endTime - this.startTime);
    const fs = require('fs');

    // fs.appendFileSync(
    //   '/home/jany/projects/bachelor-thesis/testing.txt',
    //   `${this.endTime - this.startTime}, `
    // );
  }

  /**
   *
   *
   * @private
   * @param {string} hash
   * @param {string} topic
   * @memberof MqttProvider
   */
  private handleIncomingSynAck(hash: string, topic: TopicEnum) {
    this.changeState(hash, HandshakeTypeEnum.SYN_ACK);
    const data = this.processingMessages.get(hash);
    console.log(data);

    this.publishData(data, topic, hash);
  }

  /**
   * Sends syn protocol message to network with given topic
   * @param data
   * @param topic
   */
  private sendSyn<T = any>(data: T, topic: TopicEnum): string {
    // creating match hash for data to be send
    const hash = createHashedId(data);
    const message: MqttSignalingMessage = {
      hash,
      handshake: HandshakeTypeEnum.SYN,
      publisher: PublisherEnum.SERVER
    };

    //const encrypted = encryptMessage(JSON.stringify(message));

    const encrypted = JSON.stringify(message);
    this._client.publish(topic, encrypted);

    this.processingMessages.set(hash, data);
    this._syncMessageProcessing$.next([
      ...this.processingMessagesValue,
      { hash, state: HandshakeTypeEnum.SYN }
    ]);
    return hash;
  }

  /**
   * Checks if given object is a mqtt singaling message
   * @param object
   */
  private isSignalingMqttMessage(object: MqttResponse): boolean {
    if (typeof object !== 'object') {
      try {
        object = JSON.parse(object);
      } catch (e) {
        // log error
      }
    }

    return _.has(object, 'hash') && _.has(object, 'handshake');
  }

  /**
   * Publishes data to MQTT broker
   * @param data
   * @param topic
   */
  private publishData<T = any>(data: T, topic: TopicEnum, hash?: string): void {
    const message = {
      data,
      handshake: HandshakeTypeEnum.DATA,
      hash,
      publisher: PublisherEnum.SERVER
    };
    // const encrypted = encryptMessage(JSON.stringify(message));
    const encrypted = JSON.stringify(message);
    this.processingMessages.set(hash, encrypted);
    this._client.publish(topic, encrypted);
    this.changeState(hash, HandshakeTypeEnum.DATA);
  }

  /**
   *
   *
   * @private
   * @param {string} toChange
   * @param {HandshakeTypeEnum} newState
   * @memberof MqttProvider
   */
  private changeState(toChange: string, newState: HandshakeTypeEnum) {
    const newValue = this.processingMessagesValue.filter(
      ({ hash }) => hash !== toChange
    );
    this._syncMessageProcessing$.next([
      ...newValue,
      { hash: toChange, state: newState }
    ]);
  }

  private removeFromProcessingMessagesSubject(toRemove: string) {
    // we only want to remove without emiting to subsribes
    this.processingMessagesValue = this.processingMessagesValue.filter(
      ({ hash }) => hash !== toRemove
    );
    this._syncMessageProcessing$.next(this.processingMessagesValue);
  }

  public repeatSyncProcess(topic: TopicEnum, hash: string) {
    console.log('repeat sync');
    const message = this.processingMessages.get(hash);
    this._client.publish(topic, message);
  }

  private processIncommingRequest(topic: TopicEnum, data) {
    if (topic === 'data') {
      of(data)
        .pipe(
          mergeMap(d => this.appService.storeData(d)),
          take(1)
        )
        .subscribe();
    } else if (topic === 'config') {
      if (data.config_req) {
        this.publishSubject.next({
          topic: TopicEnum.CONFIG,
          value: { nodeId: data.node_id }
        });
      }
    } else {
      // can be atacker, can be logged to the db
      console.error(
        'Unsuported topic used',
        ' | ',
        new Date().toLocaleTimeString()
      );
    }
  }
}
