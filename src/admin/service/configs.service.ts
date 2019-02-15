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

  storeConfig(config: NetworkConfig) {
    this.checkConfigsExpiration().pipe();
  }

  createConfig(config: NetworkConfig) {
    this.checkConfigsExpiration().pipe();
  }

  patchConfig(config: NetworkConfig) {}

  deleteConfig() {}

  private checkConfigsExpiration(): Observable<any> {
    const expirationPeriod = moment()
      .subtract(6, 'months')
      .toDate();
    try {
      return from(
        this.configsModel
          .deleteMany({ createdAt: { $lt: expirationPeriod } })
          .exec()
      );
    } catch (e) {
      throw e;
    }
  }

  private validateConfig(config: NetworkConfig) {
    // make some validation
    return;
  }
}
