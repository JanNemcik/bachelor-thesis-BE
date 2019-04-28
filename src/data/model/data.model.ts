import { Document } from 'mongoose';
import { NodeDeviceTypeEnum, AirSensorQualityEnum } from '../interfaces';

export interface DataModel extends Document {
  nodeId: string;
  nodeType: NodeDeviceTypeEnum;
  timestamp: number;
  gasLeak?: boolean;
  temp?: number;
  humidity?: number;
  smokeLeak?: boolean;
  airQuality?: AirSensorQualityEnum;
  lux?: number;
  fire?: boolean;
  obstacle?: number;
  movement?: { [key: string]: number };
}
