import * as crypto_js from 'crypto-js';
import { MQTT_MESSAGE_PSK } from './constants';
import {
  has as isProhibited,
  sanitize as sanitizeQuery
} from 'express-mongo-sanitize';
import { MqttResponse } from '../data/interfaces';
/**
 * Encrypts given message
 * @param message
 */
export function encryptMessage(message: string): string {
  return crypto_js.AES.encrypt(
    message,
    MQTT_MESSAGE_PSK,
    crypto_js.TripleDES
  ).toString();
}

/**
 * Decryptes given message
 * @param message
 */
export function decryptMessage(message: string): string {
  return crypto_js.AES.decrypt(
    message,
    MQTT_MESSAGE_PSK,
    crypto_js.TripleDES
  ).toString(crypto_js.enc.Utf8);
}

/**
 * Return hashed string of length 10
 * @param toHash
 */
export const createHashedId = (toHash): string =>
  crypto_js
    .SHA256(JSON.stringify(toHash))
    .toString()
    .substr(0, 10);

export function validateMessage(data: MqttResponse): number | MqttResponse {
  const containsInjections = isProhibited(data);
  const copiedData =
    typeof data === 'object' ? JSON.stringify({ ...data }) : '' + data;
  const match = copiedData.match('nieco');

  if ((match && match.length) || containsInjections) {
    console.log('attacker');
    return data.nodeId as number;
  }
  return data;
}
