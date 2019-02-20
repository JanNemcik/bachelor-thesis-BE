import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DataSchema } from '../data';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'DataModel', schema: DataSchema, collection: 'data' }
    ])
  ],
  providers: []
})
export class MainModule {}
