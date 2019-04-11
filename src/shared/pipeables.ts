import { pipe, from, of } from 'rxjs';
import { mergeMap, map, reduce } from 'rxjs/operators';
import _ = require('lodash');
import { createInstance } from './resolve-factory.functions';
import { Document, Model } from 'mongoose';

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

export const storeToDB = <T extends Document>(modelInstance: Model<T>) =>
  pipe(
    map(toStore => createInstance<T>(modelInstance, toStore)),
    mergeMap(createdDocument => from(createdDocument.save()))
  );
