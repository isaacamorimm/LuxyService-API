import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AiService {
  private ai: GoogleGenAI;

  constructor(private prisma: PrismaService) {
    this.ai = new GoogleGenAI({ apiKey: 'AIzaSyAItjiv8BRbHoThmI99wwmA-A4vHvVWv5M' });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.ai.models.embedContent({
        model: 'text-embedding-004',
        contents: text,
      });
      const values = response.embeddings?.[0]?.values;
      if (!values) throw new Error('No embeddings returned');
      return values;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new InternalServerErrorException('Failed to generate embedding');
    }
  }

  async chat(question: string) {
    try {
      const embedding = await this.generateEmbedding(question);
      const embeddingString = `[${embedding.join(',')}]`;

      const similarDocs = await this.prisma.$queryRaw`
        SELECT id, content, 1 - (embedding <=> ${embeddingString}::vector) as similarity
        FROM "DocumentContext"
        ORDER BY embedding <=> ${embeddingString}::vector
        LIMIT 3
      ` as Array<{ id: string; content: string; similarity: number }>;

      const contextText = similarDocs.map(doc => doc.content).join('\n\n');

      const prompt = `
        Você é um assistente da LuxyService responsável por responder a dúvidas sobre nossos serviços (climatização, elétrica, CFTV, etc).
        Seja educado e prestativo.
        Utilize o contexto abaixo para responder à pergunta do cliente. Caso a informação não conste no contexto, responda que não encontrou a informação, mas peça para ele entrar em contato com os nossos especialistas.
        
        Contexto Recuperado:
        ${contextText}
        
        Pergunta do cliente:
        ${question}
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return {
        answer: response.text,
        contextUsed: similarDocs.map(d => ({ id: d.id, similarity: d.similarity }))
      };
    } catch (error) {
      console.error('Error in chat processing:', error);
      throw new InternalServerErrorException('Error processing chat request');
    }
  }
}
