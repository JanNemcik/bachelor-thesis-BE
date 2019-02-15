type MqttResponseType = string | MqttMessage;

interface MqttMessage<T = any> {
  [key: string]: T;
}

interface NetworkConfig {
  [key: string]: any;
}

export { MqttMessage, MqttResponseType, NetworkConfig };
