import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('ping')
  ping() {
    return { status: 'ok', message: 'pong' };
  }
}
