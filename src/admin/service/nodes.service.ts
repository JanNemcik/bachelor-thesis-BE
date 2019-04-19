import { Injectable, BadRequestException } from '@nestjs/common';
import { NodeDevice } from '../../data/interfaces';
import { InjectModel } from '@nestjs/mongoose';
import { NodesModel } from '../data/model/node.model';
import { Model } from 'mongoose';
import { of, from, throwError } from 'rxjs';
import {
  createInstance,
  transformFromModelToSchema,
  transformFromSchemaToModel
} from '../../shared';
import { mergeMap, catchError, map, tap, take } from 'rxjs/operators';

@Injectable()
export class NodesService {
  constructor(
    @InjectModel('NodesModel')
    private readonly nodesModel: Model<NodesModel>
  ) {}

  createNode(node: NodeDevice) {
    return of(node).pipe(
      transformFromModelToSchema(),
      map(transformed =>
        createInstance<NodesModel>(this.nodesModel, transformed)
      ),
      mergeMap(createdConfig => from(createdConfig.save())),
      catchError(
        err =>
          (() => console.error(err)) && throwError(new BadRequestException(err))
      )
    );
  }

  deleteNode(id: number) {
    return from(this.nodesModel.deleteOne({ node_id: id })).pipe(
      map(status => status.ok),
      catchError(
        err =>
          (() => console.error(err)) && throwError(new BadRequestException(err))
      )
    );
  }

  getNodesByType(type: string) {
    return from(
      this.nodesModel
        .find({ node_type: type })
        .lean()
        .exec()
    ).pipe(
      transformFromSchemaToModel(),
      take(1)
    );
  }
}
