import { pipe, from, of } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import _ = require('lodash');

export const transformFromSchemaToModel = () =>
  pipe(
    mergeMap((value: any) => (value.length ? from(value) : of(value))),
    map(result => _.mapKeys(result, (val, key) => _.camelCase(key)))
  );

export const transformFromModelToSchema = () =>
  pipe(
    mergeMap((value: any) => (value.length ? from(value) : of(value))),
    map(result => _.mapKeys(result, (val, key) => _.snakeCase(key)))
  );
