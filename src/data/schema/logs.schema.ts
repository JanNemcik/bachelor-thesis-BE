import { Schema } from 'mongoose';
import { LogStateEnum, LogStatusEnum } from '../interfaces';
import * as _ from 'lodash';

export const LOG_SCHEMA = new Schema({
  topic: String,
  hash: String,
  state: { type: Number, enum: _.values(LogStateEnum) },
  status: { type: Number, enum: _.values(LogStatusEnum) },
  err: String,
  timestamp: { type: Number, default: Date.now() }
});
