import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import {
  has as isProhibited,
  sanitize as sanitizeQuery
} from 'express-mongo-sanitize';
import { MqttNodeConfigRequest } from '../admin/data';

@Injectable()
export class MqttMessageValidationPipe implements PipeTransform<any> {
  transform(data: MqttNodeConfigRequest, metadata: ArgumentMetadata) {
    const containsInjections = isProhibited(data);
    if (containsInjections) {
      data = sanitizeQuery(data);
    }
    console.log('data in pipe', data, metadata);
    // custom validation rules
    const copiedData =
      typeof data === 'object' ? JSON.stringify({ ...data }) : data;

    const match = copiedData.match('nieco');

    if ((match && match.length) || containsInjections) {
      console.log('attacker');
      return null;
    }

    return data;
  }
}
