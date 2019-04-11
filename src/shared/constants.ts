import { Transport, ClientOptions } from '@nestjs/microservices';
import { MongooseModuleAsyncOptions } from '@nestjs/mongoose';

export const MQTT_CLIENT_OPTIONS_PROD: ClientOptions = {
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

export const DATABASE_OPTIONS_LOCAL: MongooseModuleAsyncOptions = {
  useFactory: () => ({
    uri: 'mongodb://localhost:27017/bachelor-iot'
  })
};

export const DATABASE_OPTIONS_PROD: MongooseModuleAsyncOptions = {
  useFactory: () => ({
    uri: 'mongodb://iot.itprof.sk:27017/bachelor-iot'
  })
};

export const DATABASE_OPTIONS_DEV: MongooseModuleAsyncOptions = {
  useFactory: () => ({
    uri: 'mongodb://iot.itprof.sk:27017/bachelor-iot'
  })
};

export const MQTT_MESSAGE_PSK = 'afoj';

export const MQTT_CLIENT_OPTIONS_DEV = {
  port: 18077,
  clientId:
    'mqttjs_' +
    Math.random()
      .toString(16)
      .substr(2, 8),
  username: 'jgefllim',
  password: '6_h0zInyHEEg'
};
