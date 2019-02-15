import { Document } from 'mongoose';

export interface ConfigsModel extends Document {
  [key: string]: any;
  createdAt: Date;
}
