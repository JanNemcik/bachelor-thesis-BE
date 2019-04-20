import { Schema } from 'mongoose';
import * as _ from 'lodash';
import { NodeDeviceTypeEnum, AirSensorQualityEnum } from '../interfaces';

export const DATA_SCHEMA = new Schema({
  node_id: Number,
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
  lumen: { type: Number, required: false },
  movement: { type: [Date], required: false },
  obstacle: { type: Number, required: false },
  smoke_leak: { type: Boolean, required: false },
  temperature: { type: Number, required: false }
});
