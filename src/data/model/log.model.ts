import { Document } from 'mongoose';
import { LogStateEnum, LogStatusEnum, TopicEnum } from '../interfaces';

export interface LogModel extends Document {
  topic: TopicEnum;
  hash: string;
  state: LogStateEnum;
  status: LogStatusEnum;
  err: string;
}
