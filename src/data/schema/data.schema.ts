import { Schema } from 'mongoose';

export const DataSchema = new Schema({
  code: String,
  subCode: String,
  status: String,
  description: String,
  data: {
    deviceId: String,
    command: String,
    data: Array,
    createDate: Number,
    nodeId: String,
    sensorId: String,
    cloudDate: Number
  },
  ok: Boolean
});
