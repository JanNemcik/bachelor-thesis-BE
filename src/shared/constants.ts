import { Transport, ClientOptions } from '@nestjs/microservices';

export const MQTT_CLIENT_OPTIONS: ClientOptions = {
  transport: Transport.MQTT,
  options: {
    servers: [
      {
        host: 'iot.itprof.sk',
        port: 1883
      }
    ],
    username: 'bachelor',
    password: 'iotbachelor'
  }
};
