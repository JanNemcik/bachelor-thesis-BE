import { Schema } from 'mongoose';
import * as _ from 'lodash';
import { NodeDeviceTypeEnum, AirSensorQualityEnum } from '../interfaces';

export const DATA_SCHEMA = new Schema({
  node_id: String,
  timestamp: { type: Number, default: Date.now() },
  node_type: { type: String, enum: _.values(NodeDeviceTypeEnum) },
  air_quality: {
    type: String,
    enum: _.values(AirSensorQualityEnum),
    required: false
  },
  fire: { type: Boolean, required: false },
  gas_leak: { type: Boolean, required: false },
  humidity: { type: Number, required: false },
  lux: { type: Number, required: false },
  movement: { type: Object, required: false },
  obstacle: { type: Number, required: false },
  smoke_leak: { type: Boolean, required: false },
  temp: { type: Number, required: false }
});
