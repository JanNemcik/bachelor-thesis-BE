import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigsController } from './web-api/configs.controller';
import { ConfigsService } from './service/configs.service';
import { CONFIG_SCHEMA, ADMIN_SCHEMA, NODE_SCHEMA } from './data';
import { NodesController } from './web-api/nodes.controller';
import { NodesService } from './service/nodes.service';
import { SharedModule } from '../shared/shared.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    // MongooseModule.forFeature([
    //   { name: 'ConfigsModel', schema: CONFIG_SCHEMA, collection: 'configs' },
    //   { name: 'AdminModel', schema: ADMIN_SCHEMA, collection: 'configs' },
    //   { name: 'NodesModel', schema: NODE_SCHEMA, collection: 'nodes' }
    // ]),
    SharedModule,
    DatabaseModule
  ],
  providers: [ConfigsService, NodesService],
  controllers: [ConfigsController, NodesController]
})
export class AdminModule {}
