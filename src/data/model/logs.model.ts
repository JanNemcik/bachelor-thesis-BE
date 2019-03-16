import { Document } from 'mongoose';
import { MqttMessage } from 'src/admin/data';

export interface LogsModel extends Document {
  message: MqttMessage;
  wasSuccessful: boolean;
}
