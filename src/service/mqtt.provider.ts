import { MQTT_MESSAGE_PSK, MQTT_CLIENT_OPTIONS_DEV } from '../shared/constants';
import { HandshakeTypeEnum } from '../data/interfaces/enum/handshake.enum';
import { Injectable } from '@nestjs/common';

import mqtt = require('mqtt');
import * as crypto_js from 'crypto-js';
import * as _ from 'lodash';
import {
  MqttMessage,
  MqttSignalingMessage,
  MqttResponse,
  MqttData
} from '../data/interfaces';
import { Subject, from, of, pipe, BehaviorSubject } from 'rxjs';
import { tap, filter, take, takeUntil } from 'rxjs/operators';

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
  private syncMessageProcesses$ = of(this.syncMessageProcesses);

  constructor() {
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
  }

  private init() {
    this._client.subscribe('#').on('message', (topic, message) => {
      const receivedMessage = message.toString();
      // when a message arrives, do something with it
      const decryptedMessage = JSON.parse(
        this.decryptMessage(receivedMessage)
      ) as MqttResponse;

      if (this.isSignalingMqttMessage(decryptedMessage)) {
        const { handshake } = decryptedMessage;
        switch (handshake) {
          case HandshakeTypeEnum.SYN_ACK:
            const data = this.syncMessageProcesses.get(decryptedMessage.hash);
            this.publishData(data, topic, decryptedMessage.hash);
            break;
          case HandshakeTypeEnum.SYN:
            this.confirmSyn(decryptedMessage as MqttSignalingMessage, topic);
            break;
          case HandshakeTypeEnum.ACK:
            this.syncMessageProcesses.delete(decryptedMessage.hash);
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

  getClientProviderInstance(): mqtt.Client {
    return this._client;
  }

  /**
   * Sends syn protocol message to network with given topic
   * @param data
   * @param topic
   */
  private sendSyn(data: any, topic: string): void {
    // creating match hash for data to be send
    const hash = this.hash(data);

    const message: MqttSignalingMessage = {
      hash,
      handshake: HandshakeTypeEnum.SYN
    };

    this._client.publish(topic, JSON.stringify(message));

    this.syncMessageProcesses.set(hash, data);
  }

  /**
   * Acknowledges sucessfully received data
   * @param message
   * @param topic
   */
  private acknowledge({ hash }: MqttMessage, topic: string) {
    const message = { hash, handshake: HandshakeTypeEnum.ACK };
    this._client.publish(topic, JSON.stringify(message));
  }

  /**
   * Confirms preparation to receive data
   * @param message
   * @param topic
   */
  private confirmSyn({ hash }: MqttSignalingMessage, topic: string) {
    const toEncrypt = JSON.stringify({
      hash,
      handshake: HandshakeTypeEnum.SYN_ACK
    });
    const encrypted = this.encryptMessage(toEncrypt);
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
   * Encrypts given message
   * @param message
   */
  private encryptMessage(message: string): string {
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
  private decryptMessage(message: string): string {
    return crypto_js.AES.decrypt(
      message,
      MQTT_MESSAGE_PSK,
      crypto_js.TripleDES
    ).toString(crypto_js.enc.Utf8);
  }

  /**
   * Checks the receiving availabilty of the network
   */
  public startSyncProcess(topic: string, data: any) {
    // send {type: syn} to the network
    return pipe(tap(() => this.sendSyn(data, topic)));
  }

  /**
   * Publishes data to MQTT broker
   * @param data
   * @param topic
   */
  private publishData<T = any>(data: T, topic: string, hash: string): void {
    const encrypted = this.encryptMessage(JSON.stringify(data));
    const message: MqttMessage = {
      data: encrypted,
      handshake: HandshakeTypeEnum.DATA,
      hash
    };
    this._client.publish(topic, JSON.stringify(message));
  }

  /**
   * Return hashed string of length 10
   * @param toHash
   */
  private hash = (toHash): string =>
    crypto_js
      .SHA256(JSON.stringify(toHash))
      .toString()
      .substr(0, 10);
}
