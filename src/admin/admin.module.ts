import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigsController } from './web-api/configs.controller';
import { ConfigsService } from './service/configs.service';
import { CONFIG_SCHEMA, ADMIN_SCHEMA } from './data';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ConfigsModel', schema: CONFIG_SCHEMA, collection: 'configs' },
      { name: 'AdminModel', schema: ADMIN_SCHEMA, collection: 'configs' }
    ])
  ],
  providers: [ConfigsService],
  controllers: [ConfigsController]
})
export class AdminModule {}
