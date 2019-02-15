import { Document } from 'mongoose';

export interface DataModel extends Document {
  [key: string]: any;
}
