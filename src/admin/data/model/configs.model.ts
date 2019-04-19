import { Document } from 'mongoose';

export interface ConfigsModel extends Document {
  nodeId: string;
  createdAt: Date;
  interval: number;
  nodeType: string;
}
