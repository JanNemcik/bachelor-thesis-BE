import { Injectable } from '@nestjs/common';
import { EventsGateway } from 'src/config/events.gateway';

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
