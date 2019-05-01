import { MongooseModuleAsyncOptions } from '@nestjs/mongoose';
import { IClientOptions } from 'mqtt';

export const MQTT_CLIENT_OPTIONS: IClientOptions = {
  port: 1883,
  clientId:
    'mqttjs_' +
    Math.random()
      .toString(16)
      .substr(2, 8),
  username: 'bachelor',
  password: 'iotbachelor',
  protocol: 'mqtt',
  protocolId: 'MQTT',
  host: '104.248.18.71',
  connectTimeout: 2147483647
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
    uri: 'mongodb://104.248.18.71:27017/bachelor-iot'
  })
};

export const MQTT_MESSAGE_PSK = 'afoj';
