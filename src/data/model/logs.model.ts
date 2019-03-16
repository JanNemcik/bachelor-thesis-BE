import { Document } from 'mongoose';
import { MqttMessage } from '../interfaces';

export interface LogsModel extends Document {
  message: MqttMessage;
  wasSuccessful: boolean;
}
