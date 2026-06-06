import { Controller, Get } from '@nestjs/common';
import { AppService } from '../app.service'; // Correção do caminho para o serviço

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('ping')
  ping() {
    try {
      return { status: 'ok', message: 'pong' };
    } catch (error) {
      console.error('Error in ping endpoint:', error);
      throw new Error('Internal Server Error');
    }
  }
}
