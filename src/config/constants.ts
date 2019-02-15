import { Transport, ClientOptions } from '@nestjs/microservices';

export const MQTT_CLIENT_OPTIONS: ClientOptions = {
  transport: Transport.MQTT,
  options: {
    servers: [
      {
        host: '192.168.56.101',
        port: 1883
      }
    ],
    username: 'jany',
    password: 'oHm2cti2'
  }
};
