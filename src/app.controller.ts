import { Controller, Get, HttpCode } from '@nestjs/common';
import { AppService } from './service/app.service';

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Get('logs')
  @HttpCode(200)
  getLogs() {
    return this.appService.getLogs();
  }
}
