import { pipe, from, of } from 'rxjs';
import { mergeMap, map, tap, reduce } from 'rxjs/operators';
import _ = require('lodash');

export const transformFromSchemaToModel = () =>
  pipe(
    //
    mergeMap((value: any) => (value.length ? from(value) : of(value))),
    //
    reduce(
      (prev, curr: any) => [
        ...prev,
        { ..._.mapKeys(curr, (val, key) => _.camelCase(key)) }
      ],
      []
    )
  );

export const transformFromModelToSchema = () =>
  pipe(
    mergeMap((value: any) => (value.length ? from(value) : of(value))),
    map(result => _.mapKeys(result, (val, key) => _.snakeCase(key)))
  );
