import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { ChatDto } from '../dto/chat.dto'; // Correção do caminho para o DTO
import { HttpException, HttpStatus } from '@nestjs/common';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() body: ChatDto) {
    try {
      return await this.aiService.chat(body.question);
    } catch (error) {
      console.error('Error in AI controller:', error);
      throw new HttpException({
        message: 'Erro interno do servidor',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.cause?.name || 'Unknown Error'
      }, HttpStatus.INTERNAL_SERVER_ERROR, { cause: error });
    }
  }
}
