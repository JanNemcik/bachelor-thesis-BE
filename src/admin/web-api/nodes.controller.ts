import {
  Controller,
  Post,
  HttpCode,
  Patch,
  Delete,
  Param,
  Body,
  Get,
  Query
} from '@nestjs/common';
import { NodeDevice } from '../../data/interfaces';
import { NodesService } from '../service/nodes.service';

@Controller('nodes')
export class NodesController {
  constructor(private nodesService: NodesService) {}
  @Post('')
  @HttpCode(201)
  addNode(@Body() node: NodeDevice) {
    return this.nodesService.createNode(node);
  }

  @Delete(':id')
  @HttpCode(200)
  deleteNode(@Param('id') id: number) {
    return this.nodesService.deleteNode(id);
  }

  @Get('collection')
  @HttpCode(200)
  getCollectionByType(@Query('type') type: string) {
    return this.nodesService.getNodesByType(type);
  }
}
