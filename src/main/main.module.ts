import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DataSchema } from 'src/data';
import { EventsGateway } from 'src/config/events.gateway';
import { GatewayService } from './service/gateway.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'DataModel', schema: DataSchema, collection: 'data' }
    ])
  ],
  providers: [EventsGateway, GatewayService]
})
export class MainModule {}
