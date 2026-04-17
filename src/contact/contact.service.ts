import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

    async processContactSubmission(createContactDto: CreateContactDto) {
    // Agora extraímos os 5 campos
    const { name, email, phone, service, message } = createContactDto;

    const mailOptions = {
      from: `"${name}" <${process.env.SMTP_USER}>`, 
      to: process.env.SMTP_USER,
      replyTo: email,
      subject: `Nova Solicitação de Contato - ${name} (${service})`, // Adicionei o serviço no título
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Nova Solicitação via Formulário Web</h2>
          <p>Você recebeu uma nova mensagem. Os detalhes estão abaixo:</p>
          <hr />
          <p><strong>Remetente:</strong> ${name}</p>
          <p><strong>E-mail de Contato:</strong> ${email}</p>
          <p><strong>Telefone:</strong> ${phone}</p>
          <p><strong>Sistema de Interesse:</strong> ${service.toUpperCase()}</p>
          <p><strong>Escopo do Projeto:</strong></p>
          <p style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; border-left: 4px solid #0056b3;">
            ${message}
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      
      // Como o Prisma está configurado no repositório, você pode 
      // opcionalmente injetar o PrismaService aqui para salvar o 
      // histórico de contatos no banco de dados antes de retornar.
      
      return { status: 'success', message: 'E-mail encaminhado com sucesso.' };
    } catch (error) {
      throw new InternalServerErrorException('Falha no processamento do e-mail via SMTP.');
    }
  }
}