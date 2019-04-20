import { GatewayService } from './service/gateway.service';
import { Controller } from '@nestjs/common';
import { AppService } from './service/app.service';
import { tap } from 'rxjs/operators';

@Controller()
export class AppController {
  constructor(
    private appService: AppService,
    private readonly gatewayService: GatewayService
  ) {}

  // TODO: use with custom mqtt implementation
  saveData(data: any) {
    return this.appService.storeData(data).pipe(
      tap(broadcastData => {
        console.log('broadcast', broadcastData);
        this.gatewayService.brodcastData(broadcastData, 'update_data');
      })
    );
  }
}
