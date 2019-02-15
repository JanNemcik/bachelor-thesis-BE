import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigsController } from './web-api/configs.controller';
import { ConfigsService } from './service/configs.service';
import { ConfigsSchema, AdminSchema } from './data';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ConfigsModel', schema: ConfigsSchema, collection: 'configs' },
      { name: 'AdminModel', schema: AdminSchema, collection: 'configs' }
    ])
  ],
  providers: [ConfigsService],
  controllers: [ConfigsController]
})
export class AdminModule {}
