import { Controller, Post, Body } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';

// A rota no navegador/axios será algo como: http://localhost:3000/contato
@Controller('contato') 
export class ContactController {
  // Injeta o service automaticamente
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async create(@Body() createContactDto: CreateContactDto) {
    // Repassa os dados validados para a função que envia o e-mail
    return this.contactService.sendContactEmail(createContactDto);
  }
}