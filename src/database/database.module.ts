import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CONFIG_SCHEMA, ADMIN_SCHEMA, NODE_SCHEMA } from '../admin/data';
import { DATABASE_OPTIONS_LOCAL } from '../shared';
import { AUTH_SCHEMA } from '../auth/data';
import { LOG_SCHEMA, DATA_SCHEMA } from '../data';
import { Schema } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ConfigsModel', schema: CONFIG_SCHEMA, collection: 'configs' },
      { name: 'AdminModel', schema: ADMIN_SCHEMA, collection: 'configs' },
      { name: 'NodesModel', schema: NODE_SCHEMA, collection: 'nodes' },
      { name: 'AuthModel', schema: AUTH_SCHEMA, collection: 'users' },
      { name: 'LogsModel', schema: LOG_SCHEMA, collection: 'logs' },
      { name: 'DataModel', schema: DATA_SCHEMA, collection: 'data' }
    ])
  ]
})
export class DatabaseModule {
  static forChild(...args: Schema[]) {
    return;
  }
}
