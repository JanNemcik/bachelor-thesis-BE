import { NodeConfig } from 'src/data/interfaces';

interface MqttNodeConfig extends NodeConfig {
  /**
   * format MM:SS
   */
  interval: string;
}
interface MqttNodeConfigRequest extends NodeConfig {}

export { MqttNodeConfig, MqttNodeConfigRequest };
