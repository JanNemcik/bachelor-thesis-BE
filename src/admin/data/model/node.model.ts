import { Document } from 'mongoose';
import { NodeDeviceTypeEnum } from '../../../data/interfaces';

export interface NodesModel extends Document {
  nodeId: number;
  nodeType: NodeDeviceTypeEnum;
}
