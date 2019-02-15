import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DataSchema } from 'src/data';
import { EventsGateway } from 'src/config/events.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'DataModel', schema: DataSchema, collection: 'data' }
    ])
  ],
  providers: []
})
export class MainModule {}
