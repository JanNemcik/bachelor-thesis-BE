import { Injectable } from '@nestjs/common';
import { EventsGateway } from 'src/config/events.gateway';

/**
 * Provides operations to gateway socket
 */
@Injectable()
export class GatewayService {
  /**
   * @param gatewayProvider gateway provider
   */
  constructor(private readonly gatewayProvider: EventsGateway) {}

  /**
   * Broadcasts data to client
   * @param data generic typed data object to be send to client
   * @param messageIdentity gateway message identity
   */
  brodcastData<T = any>(data: T, messageIdentity: string) {
    this.gatewayProvider.emit<T>(data, messageIdentity);
  }
}
