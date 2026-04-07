import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AiService {
  private ai: GoogleGenAI;

  constructor(private prisma: PrismaService) {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
const response = await this.ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: text, 
      config: {
        outputDimensionality: 768,
      }
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
Você é o Baga-IA, assistente inteligente da Luxy Service. 
Sua missão é ajudar clientes com dúvidas sobre nossos serviços, produtos e soluções de forma amigável e profissional.

## INSTRUÇÕES DE COMPORTAMENTO:
1. **Respostas Naturais:** Use uma linguagem conversacional, amigável e profissional. Evite redação robótica.
2. **Quando Não Souber:** Se a informação não estiver no contexto recuperado, seja honesto:
   - "Essa é uma ótima pergunta, mas não tenho essa informação específica no momento."
   - "Deixa eu ser honesto: não tenho detalhes sobre isso na minha base de conhecimento."
3. **Encaminhamento Para Contato:** Ofereça uma rota de contato natural quando não tiver resposta:
   - "Nossos especialistas estão prontos para detalhar isso com você. Pode ligar (11) 9 9280-1900 ou enviar um email para contato@luxysolar.com.br"
   - "Recomendo falar com nosso time diretamente - eles podem ajudar melhor. (11) 9 9280-1900"
4. **Personalize:** Se for dúvida sobre um serviço específico (CFTV, Elétrica, ETA, etc), mencione que pode conectar com especialistas daquele segmento.
5. **Nunca Diga:** "isso não foi definido", "não tenho essa funcionalidade", "não posso ajudar". Sempre ofereça uma alternativa.
6. **Seja Breve:** Respostas diretas e informativas, sem excesso de informação.

## CONTEXTO SOBRE NOSSOS SERVIÇOS:
${contextText}

---

PERGUNTA DO CLIENTE:
${question}

---

RESPONDA DE FORMA NATURAL, PRESTATIVA E PROFISSIONAL.
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
