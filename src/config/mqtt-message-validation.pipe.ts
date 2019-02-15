import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import {
  has as isProhibited,
  sanitize as sanitizeQuery
} from 'express-mongo-sanitize';
import { MqttResponseType } from 'src/data/interfaces';

@Injectable()
export class MqttMessageValidationPipe
  implements PipeTransform<MqttResponseType> {
  transform(data: any, metadata: ArgumentMetadata) {
    const containsInjections = isProhibited(data);
    if (containsInjections) {
      data = sanitizeQuery(data);
    }
    // custom validation rules
    const copiedData =
      typeof data === 'object' ? JSON.stringify({ ...data }) : data;
    const match = copiedData.match('afoj');
    if ((match && match.length) || containsInjections) {
      console.log('attacker');
      return null;
    }
    return data;
  }
}
