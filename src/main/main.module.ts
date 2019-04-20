import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DATA_SCHEMA } from '../data';

@Module({
  imports: [
    MongooseModule.forFeature([
      // { name: 'DataModel', schema: DATA_SCHEMA, collection: 'data' }
    ])
  ],
  providers: []
})
export class MainModule {}
