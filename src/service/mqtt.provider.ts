import {
  MQTT_CLIENT_OPTIONS_DEV,
  MQTT_CLIENT_OPTIONS
} from '../shared/constants';
import { Injectable } from '@nestjs/common';
import mqtt = require('mqtt');
import * as _ from 'lodash';
import {
  MqttMessage,
  MqttSignalingMessage,
  MqttResponse,
  MqttData,
  HandshakeTypeEnum,
  TopicEnum,
  PublisherEnum
} from '../data/interfaces';
import { pipe, BehaviorSubject } from 'rxjs';
import { map, share } from 'rxjs/operators';
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
  private clientId = MQTT_CLIENT_OPTIONS.clientId;
  // stores currently processing messages
  private processingMessages: Map<string, MqttData> = new Map();
  // subject for network synchronization handling
  private _syncMessageProcesses$ = new BehaviorSubject<
    Array<{ hash: string; state: HandshakeTypeEnum }>
  >([]);

  private sharedMessagesProcesses = this._syncMessageProcesses$
    .asObservable()
    .pipe(share());

  // value of network synchronization handling subject
  private processingMessagesValue: Array<{
    hash: string;
    state: HandshakeTypeEnum;
  }>;

  public get syncMessageProcesses$() {
    return this.sharedMessagesProcesses;
  }

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
    this.processingMessagesValue = this._syncMessageProcesses$.value;
  }

  /**
   *
   *
   * @returns {mqtt.Client}
   * @memberof MqttProvider
   */
  getClientProviderInstance(): mqtt.Client {
    return this._client;
  }

  /**
   * Checks the receiving availabilty of the network
   */
  startSyncProcess(topic: TopicEnum, data: any) {
    // send {type: syn} to the network
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
      // when a message arrives, do something with it
      try {
        const decryptedMessage = JSON.parse(
          decryptMessage(receivedMessage)
        ) as MqttResponse;
        if (decryptedMessage.publisher === PublisherEnum.NETWORK) {
          if (this.isSignalingMqttMessage(decryptedMessage)) {
            const { handshake } = decryptedMessage;
            switch (handshake) {
              case HandshakeTypeEnum.SYN_ACK:
                this.handleIncomingSynAck(decryptedMessage.hash, topic);
                break;
              case HandshakeTypeEnum.SYN:
                this.confirmSyn(
                  decryptedMessage as MqttSignalingMessage,
                  topic
                );
                break;
              case HandshakeTypeEnum.ACK:
                this.handleIncomingAck(decryptedMessage.hash);
                break;
              default:
                // log error
                break;
            }
          } else if (this.isMqttMessage(decryptedMessage)) {
            const { handshake, data } = decryptedMessage as MqttMessage;
            if (handshake === HandshakeTypeEnum.DATA) {
              // do stuff with data
              const validatedData = validateMessage(data);
              if (typeof validatedData === 'number') {
                // place to get all ledgers and recognize the attacker
                // validated data is nodeId of attacker
              } else {
                this.processIncommingRequest(topic, validatedData);
                this.acknowledge(decryptedMessage as MqttMessage, topic);
              }
            } else {
              // do stuff or log error
            }
          } else {
            // log error
          }
        }
      } catch (e) {
        console.error(e);
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

    const encrypted = encryptMessage(JSON.stringify(message));

    this._client.publish(topic, encrypted);

    this.processingMessages.set(hash, encrypted);
    this._syncMessageProcesses$.next([
      ...this.processingMessagesValue,
      { hash, state: HandshakeTypeEnum.SYN }
    ]);
    return hash;
  }

  /**
   * Acknowledges sucessfully received data
   * @param message
   * @param topic
   */
  private acknowledge({ hash }: MqttMessage, topic: TopicEnum) {
    const message = { hash, handshake: HandshakeTypeEnum.ACK };
    this._client.publish(topic, JSON.stringify(message));
    this.processingMessagesValue = this.processingMessagesValue.filter(
      val => val.hash !== hash
    );
  }

  /**
   * Confirms preparation to receive data
   * @param message
   * @param topic
   */
  private confirmSyn({ hash }: MqttSignalingMessage, topic: TopicEnum) {
    // TODO: need to handle failure at network layer, if there is now ack confirmation of received data
    this._syncMessageProcesses$.next([
      ...this.processingMessagesValue,
      { hash, state: HandshakeTypeEnum.SYN_ACK }
    ]);
    const message = JSON.stringify({
      hash,
      handshake: HandshakeTypeEnum.SYN_ACK
    });
    const encrypted = encryptMessage(message);
    this._client.publish(topic, encrypted);
  }

  /**
   * Checks if given object is a mqtt message with data
   * @param object
   */
  private isMqttMessage(object: MqttResponse): boolean {
    if (typeof object !== 'object') {
      try {
        object = JSON.parse(object);
      } catch (e) {
        // log error
      }
      return (
        _.has(object, 'data') &&
        _.has(object, 'hash') &&
        _.has(object, 'handshake')
      );
    }
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
  private publishData<T = any>(data: T, topic: TopicEnum, hash: string): void {
    const message = {
      data,
      handshake: HandshakeTypeEnum.DATA,
      hash,
      publisher: PublisherEnum.SERVER
    };
    const encrypted = encryptMessage(JSON.stringify(message));
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
    this._syncMessageProcesses$.next([
      ...newValue,
      { hash: toChange, state: newState }
    ]);
  }

  private removeFromProcessingMessagesSubject(toRemove: string) {
    // we only want to remove without emiting to subsribes
    this.processingMessagesValue = this.processingMessagesValue.filter(
      ({ hash }) => hash !== toRemove
    );
    this._syncMessageProcesses$.next(this.processingMessagesValue);
  }

  repeatSyncProcess(topic: TopicEnum, hash: string) {
    console.log('repeat sync');
    const message = this.processingMessages.get(hash);
    this._client.publish(topic, message);
  }

  private processIncommingRequest(topic: TopicEnum, data) {
    if (topic === 'data') {
      this.appService.storeData(data);
    } else if (topic === 'config') {
    } else {
      // can be atacker, can be logged to the db
      console.error('Unsuported topic used');
    }
  }
}
