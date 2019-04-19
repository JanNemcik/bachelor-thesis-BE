import { Schema } from 'mongoose';
import { LogStateEnum } from '../interfaces';
import * as _ from 'lodash';

export const LOG_SCHEMA = new Schema({
  topic: String,
  hash: String,
  state: { type: Number, enum: _.values(LogStateEnum) }
});
