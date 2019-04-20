import { EventsGateway } from '../config/events.gateway';
import { Injectable } from '@nestjs/common';

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
    this.gatewayProvider.emit<T>(data, messageIdentity);
  }
}
