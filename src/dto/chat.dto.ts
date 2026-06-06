// src/dto/chat.dto.ts
export class ChatDto {
  @IsString()
  @IsNotEmpty({ message: 'A pergunta é obrigatória.' })
  question: string;
}
