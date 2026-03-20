import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const luxyData = [
  "A Luxy Service faz parte de um grupo fundado em 2009 (Lumens Projetos Elétricos). Em 2021 fundou a Luxy Solar e em 2025 a Luxy Service, com foco em facilities, manutenção predial, controle de acesso e CFTV. Nossa missão é oferecer soluções integradas e sustentáveis em energia e facilities.",
  "Diferenciais da Luxy Service: Oferecemos operação impecável com risco zero. Contamos com plantão emergencial 24/7, cumprimento de NRs (NR-10 para elétrica, NR-35 para altura) e gestão de PMOC. Possuímos compliance B2B integrado, acionamento via NOC corporativo, PPRA, PCMSO e seguros de responsabilidade civil.",
  "Serviço de Manutenção Predial e Facilities: Gestão integral da infraestrutura corporativa e industrial. Atuamos com manutenção preventiva, corretiva e preditiva. O escopo inclui atendimento emergencial com SLA restrito, limpeza técnica, conservação e gestão de áreas críticas.",
  "Serviço de Instalação Elétrica e HVAC: Engenharia aplicada a sistemas de energia e climatização. Especialistas em baixa e média tensão, operando cabines primárias. O escopo inclui Laudos Técnicos (SPDA, NR10, Termografia), PMOC para Split, VRF, Chillers e exaustão.",
  "Serviço de Segurança Eletrônica e Acesso: Arquiteturas avançadas de segurança patrimonial. O escopo inclui CFTV IP de Alta Definição, biometria facial homologada (KeyAccess) e controle de acesso de alto fluxo. Integramos com centrais de monitoramento e NOC.",
  "Serviço de Sistemas Prediais e ETA/ETE: Operação diligente e manutenção de Estações de Tratamento de Água (ETA) e Esgoto (ETE). Nosso corpo de engenharia gerencia coagulação, filtração, desinfecção e gestão sustentável de lodo.",
  "Arquitetura de CFTV IP: Projetamos topologias IP em anel ou estrela, com backbones em fibra óptica e switches PoE+ para zero latência em fluxos de 4K a 8K. Integramos VMS enterprise-grade (Digifort, Milestone) com análises de vídeo como LPR e detecção de perímetro.",
  "Controle de Acesso Físico Inteligente: Autenticação multifator para liberação de portas, catracas e cancelas. Utilizamos Leitores de Reconhecimento Facial com tecnologia anti-spoofing. Integração nativa com sistemas C-Cure 9000 e Amadeus."
];

async function main() {
  console.log('Iniciando a vetorização dos dados da Luxy Service...');

  for (const text of luxyData) {
    const response = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: text,
      config: {
        outputDimensionality: 768,
      }
    });
    
    const embeddingArray = response.embeddings?.[0]?.values;
    
    if (!embeddingArray) {
      console.error(`⚠️ Falha ao gerar embedding para: "${text.substring(0, 40)}..."`);
      continue; 
    }
    
    const vectorString = `[${embeddingArray.join(',')}]`;

    // D. Insere no banco via Raw Query
    await prisma.$executeRaw`
      INSERT INTO "DocumentContext" (id, content, embedding, "createdAt")
      VALUES (gen_random_uuid(), ${text}, ${vectorString}::vector, NOW())
    `;
    
    console.log(`✅ Inserido: "${text.substring(0, 40)}..."`);
  }

  console.log('🎉 Banco populado com sucesso! A IA já tem conhecimento sobre a Luxy.');
}

main()
  .catch((e) => {
    console.error('Erro ao popular o banco:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });