import { HandshakeTypeEnum } from './enum/handshake.enum';
import { NodeConfig } from '.';

interface MqttNodeConfig extends NodeConfig {
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
type MqttResponse = MqttMessage | MqttSignalingMessage;
type MqttData = any;
export {
  MqttNodeConfig,
  MqttNodeConfigRequest,
  MqttMessage,
  MqttMessageWrapper,
  MqttSignalingMessage,
  MqttResponse,
  MqttData
};
