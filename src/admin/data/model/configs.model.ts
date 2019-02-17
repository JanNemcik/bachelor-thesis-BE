import { Document } from 'mongoose';

export interface ConfigsModel extends Document {
  nodeId: number;
  createdAt: Date;
  interval: number;
  nodeType: string;
}
