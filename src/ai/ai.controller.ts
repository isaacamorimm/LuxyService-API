import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

export class ChatDto {
  question: string;
}

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() body: ChatDto) {
    if (!body.question) {
      return { error: 'Pergunta obrigatória' };
    }
    return this.aiService.chat(body.question);
  }
}
