import { Schema } from 'mongoose';
import { NodeDeviceTypeEnum } from '../../../data/interfaces';
import * as _ from 'lodash';

export const NODE_SCHEMA = new Schema({
  node_id: { type: String, unique: true },
  node_type: { type: String, enum: _.values(NodeDeviceTypeEnum) }
});
