import { HandshakeTypeEnum } from './enum/handshake.enum';
import { NodeConfig } from '.';
import { LogModel } from '../model/log.model';
import { NodeDevice } from './node';

interface MqttNodeConfig extends NodeDevice {
  /**
   * format MM:SS
   */
  interval: string;
}
interface MqttNodeConfigRequest extends NodeConfig {}

interface MqttSignalingMessage {
  hash: string;
  handshake: HandshakeTypeEnum;
}

interface MqttMessage<T = any> extends MqttSignalingMessage {
  data: T;
}

interface MqttMessageWrapper<T = any> {
  data: T;
  topic: string;
}

interface MqttResponse extends MqttMessage {
  nodeId: number;
}
type MqttData = any;
interface MqttLogManager {
  doc: LogModel;
  err?: string;
}
export {
  MqttNodeConfig,
  MqttNodeConfigRequest,
  MqttMessage,
  MqttMessageWrapper,
  MqttSignalingMessage,
  MqttResponse,
  MqttData,
  MqttLogManager
};
