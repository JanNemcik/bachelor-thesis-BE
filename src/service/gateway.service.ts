import { HandshakeTypeEnum } from './../data/interfaces/enum/handshake.enum';
import { EventsGateway } from '../config/events.gateway';
import { Injectable } from '@nestjs/common';
import { SHA256 } from 'crypto-js';
import { MqttMessage } from '../admin/data';
import { BehaviorSubject } from 'rxjs';

/**
 * Provides operations to gateway socket
 * @export
 * @class GatewayService
 */
@Injectable()
export class GatewayService {
  constructor(private readonly gatewayProvider: EventsGateway) {}

  /**
   * Broadcasts data to client
   * @template T
   * @param {T} data
   * @param {string} messageIdentity
   * @memberof GatewayService
   */
  brodcastData<T = any>(data: T, messageIdentity: string) {
    console.log(messageIdentity, data);
    this.gatewayProvider.emit<T>(data, messageIdentity);
  }
}
