import { Document } from 'mongoose';
import { LogStateEnum, LogStatusEnum } from '../interfaces';

export interface LogModel extends Document {
  topic: string;
  hash: string;
  state: LogStateEnum;
  status: LogStatusEnum;
  err: string;
}
