import { MQTT_CLIENT_OPTIONS_DEV } from '../shared/constants';
import { Injectable } from '@nestjs/common';
import mqtt = require('mqtt');
import * as _ from 'lodash';
import {
  MqttMessage,
  MqttSignalingMessage,
  MqttResponse,
  MqttData,
  HandshakeTypeEnum
} from '../data/interfaces';
import { pipe, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppService } from './app.service';

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
  // stores currently executing messages
  private syncMessageProcesses: Map<string, MqttData> = new Map();
  private _syncMessageProcesses$ = new BehaviorSubject<
    Array<{ hash: string; state: HandshakeTypeEnum }>
  >([]);
  private syncMessageProcessesValue: Array<{
    hash: string;
    state: HandshakeTypeEnum;
  }>;

  public get syncMessageProcesses$() {
    return this._syncMessageProcesses$;
  }

  constructor(private appService: AppService) {
    console.info(
      '[MQTT Provider] - ',
      date.toLocaleDateString(),
      date.toLocaleTimeString(),
      ': MQTT Provider initialized'
    );

    this._client = mqtt.connect(
      'mqtt://m24.cloudmqtt.com',
      MQTT_CLIENT_OPTIONS_DEV
    );

    this._client.on('connect', () => {
      this.init();
    });
    this.syncMessageProcessesValue = this._syncMessageProcesses$.value;
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
  startSyncProcess<T>(topic: string, data: T) {
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
    this._client.subscribe('#').on('message', (topic, message) => {
      const receivedMessage = message.toString();
      // when a message arrives, do something with it
      const decryptedMessage = JSON.parse(
        this.appService.decryptMessage(receivedMessage)
      ) as MqttResponse;

      if (this.isSignalingMqttMessage(decryptedMessage)) {
        const { handshake } = decryptedMessage;
        switch (handshake) {
          case HandshakeTypeEnum.SYN_ACK:
            this.handleIncomingSynAck(decryptedMessage.hash, topic);
            break;
          case HandshakeTypeEnum.SYN:
            this.confirmSyn(decryptedMessage as MqttSignalingMessage, topic);
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
          this.acknowledge(decryptedMessage as MqttMessage, topic);
        } else {
          // do stuff or log error
        }
      } else {
        // log error
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
    this.syncMessageProcesses.delete(hash);
    // first emit to subscribers
    this.changeState(hash, HandshakeTypeEnum.ACK);
    // then remove without emiting
    this.removeFromProcessedMessagesSubject(hash);
  }

  /**
   *
   *
   * @private
   * @param {string} hash
   * @param {string} topic
   * @memberof MqttProvider
   */
  private handleIncomingSynAck(hash: string, topic: string) {
    this.changeState(hash, HandshakeTypeEnum.SYN_ACK);
    const data = this.syncMessageProcesses.get(hash);
    this.publishData(data, topic, hash);
  }

  /**
   * Sends syn protocol message to network with given topic
   * @param data
   * @param topic
   */
  private sendSyn<T = any>(data: T, topic: string): string {
    // creating match hash for data to be send
    const hash = this.appService.createHashedId(data);

    const message: MqttSignalingMessage = {
      hash,
      handshake: HandshakeTypeEnum.SYN
    };

    this._client.publish(topic, JSON.stringify(message));

    this.syncMessageProcesses.set(hash, data);
    this._syncMessageProcesses$.next([
      ...this.syncMessageProcessesValue,
      { hash, state: HandshakeTypeEnum.SYN }
    ]);
    return hash;
  }

  /**
   * Acknowledges sucessfully received data
   * @param message
   * @param topic
   */
  private acknowledge({ hash }: MqttMessage, topic: string) {
    const message = { hash, handshake: HandshakeTypeEnum.ACK };
    this._client.publish(topic, JSON.stringify(message));
    this.syncMessageProcessesValue = this.syncMessageProcessesValue.filter(
      val => val.hash !== hash
    );
  }

  /**
   * Confirms preparation to receive data
   * @param message
   * @param topic
   */
  private confirmSyn({ hash }: MqttSignalingMessage, topic: string) {
    // TODO: need to handle failure at network layer, if there is now ack confirmation of received data
    this._syncMessageProcesses$.next([
      ...this.syncMessageProcessesValue,
      { hash, state: HandshakeTypeEnum.SYN_ACK }
    ]);
    const toEncrypt = JSON.stringify({
      hash,
      handshake: HandshakeTypeEnum.SYN_ACK
    });
    const encrypted = this.appService.encryptMessage(toEncrypt);
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
        return (
          _.has(object, 'data') &&
          _.has(object, 'hash') &&
          _.has(object, 'handshake')
        );
      } catch (e) {
        // log error
      }
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
        return _.has(object, 'hash') && _.has(object, 'handshake');
      } catch (e) {
        // log error
      }
    }
  }

  /**
   * Publishes data to MQTT broker
   * @param data
   * @param topic
   */
  private publishData<T = any>(data: T, topic: string, hash: string): void {
    const encrypted = this.appService.encryptMessage(JSON.stringify(data));
    const message: MqttMessage = {
      data: encrypted,
      handshake: HandshakeTypeEnum.DATA,
      hash
    };
    this._client.publish(topic, JSON.stringify(message));
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
    const newValue = this.syncMessageProcessesValue.filter(
      ({ hash }) => hash !== toChange
    );
    this._syncMessageProcesses$.next([
      ...newValue,
      { hash: toChange, state: newState }
    ]);
  }

  /**
   *
   *
   * @private
   * @param {string} toRemove
   * @memberof MqttProvider
   */
  private removeFromProcessedMessagesSubject(toRemove: string) {
    // we only want to remove without emiting to subsribes
    this.syncMessageProcessesValue = this.syncMessageProcessesValue.filter(
      ({ hash }) => hash !== toRemove
    );
  }

  repeatSyncProcess(topic: string, hash: string) {
    const message: MqttSignalingMessage = {
      hash,
      handshake: HandshakeTypeEnum.SYN
    };

    this._client.publish(topic, JSON.stringify(message));
  }
}
