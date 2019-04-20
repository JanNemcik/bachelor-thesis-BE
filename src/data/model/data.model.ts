import { Document } from 'mongoose';
import { NodeDeviceTypeEnum, AirSensorQualityEnum } from '../interfaces';

export interface DataModel extends Document {
  nodeId: number;
  nodeType: NodeDeviceTypeEnum;
  timestamp: number;
  gasLeak?: boolean;
  temperature?: number;
  humidity?: number;
  smokeLeak?: boolean;
  airQuality?: AirSensorQualityEnum;
  lumen?: number;
  fire?: boolean;
  obstacle?: number;
  movement?: Date[];
}
