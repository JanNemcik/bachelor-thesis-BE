import { Schema } from 'mongoose';
import { NodeDeviceTypeEnum } from '../../../data/interfaces';
import * as _ from 'lodash';

export const CONFIG_SCHEMA = new Schema({
  node_id: { type: String, required: true },
  created_at: { type: Date, default: Date.now(), required: true },
  interval: { type: String, required: true },
  node_type: {
    type: String,
    required: true,
    enum: _.values(NodeDeviceTypeEnum)
  },
  is_current: { type: Boolean, required: true }
});
