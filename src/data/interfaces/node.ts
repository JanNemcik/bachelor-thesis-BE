import { AirSensorQualityEnum, NodeDeviceTypeEnum } from './enum/node.enum';

interface NodeDevice {
  nodeId: number;
  nodeType: NodeDeviceTypeEnum;
}

interface NodeConfig extends NodeDevice {
  // indicating wheter it is a config request, not neccessary to store
  configReq: boolean;
}

interface NodeData extends NodeDevice {
  timestamp: Date;
}

interface AirSensorNode extends NodeData {
  gasLeak: boolean;
  temperature: number;
  humidity: number;
  smokeLeak: boolean;
  airQuality: AirSensorQualityEnum;
}

interface LightSensorNode extends NodeData {
  lumen: number;
  fire: boolean;
}

interface MotionSensorNode extends NodeData {
  /**
   * Obstacle in centimeters
   */
  obstacle: number;
  /**
   * Date array of recognized movements
   */
  movement: Date[];
}

type SensorNodeType = LightSensorNode | MotionSensorNode | AirSensorNode;

export {
  MotionSensorNode,
  LightSensorNode,
  AirSensorNode,
  NodeConfig,
  SensorNodeType,
  NodeDevice
};
