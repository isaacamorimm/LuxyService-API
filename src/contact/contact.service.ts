import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ContactService {
  private transporter;

  constructor() {
    // Configura o enviador de e-mails usando as variáveis de ambiente
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true para 465, false para outras portas
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendContactEmail(createContactDto: CreateContactDto) {
    const { name, email, phone, service, message } = createContactDto;

    const mailOptions = {
      from: `"Site Luxy Service" <${process.env.SMTP_USER}>`,
      to: process.env.EMAIL_RECEIVER, // E-mail da equipe comercial
      replyTo: email,
      subject: `Novo Lead do Site: ${name} - ${service}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
            <h2 style="color: #0056b3;">Novo contato recebido pelo site</h2>
            <p><strong>Nome do Cliente:</strong> ${name}</p>
            <p><strong>E-mail Corporativo:</strong> ${email}</p>
            <p><strong>Telefone:</strong> ${phone}</p>
            <p><strong>Sistema de Interesse:</strong> <span style="text-transform: capitalize;">${service}</span></p>
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
            <p><strong>Escopo do Projeto:</strong></p>
            <p style="background-color: #f9f9f9; padding: 15px; border-radius: 4px;">${message}</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { message: 'Contato recebido e processado com sucesso.' };
    } catch (error) {
      console.error('[Erro] Falha ao enviar e-mail:', error);
      throw new InternalServerErrorException('Ocorreu um erro interno ao enviar a mensagem.');
    }
  }
}