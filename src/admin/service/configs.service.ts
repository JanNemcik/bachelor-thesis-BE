import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigsModel } from '../data';
import { NetworkConfig } from 'src/data/interfaces';
import * as moment from 'moment';
import { from, Observable } from 'rxjs';

@Injectable()
export class ConfigsService {
  constructor(
    @InjectModel('ConfigsModel')
    private readonly configsModel: Model<ConfigsModel>
  ) {}

  storeConfig(config: NetworkConfig) {}

  createConfig(config: NetworkConfig) {}

  patchConfig(config: NetworkConfig) {}

  deleteConfig() {}

  getAllConfigs() {}
}
