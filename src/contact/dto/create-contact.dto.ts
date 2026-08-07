import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  name: string;

  @IsEmail({}, { message: 'Forneça um endereço de e-mail válido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'O telefone é obrigatório.' })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'O serviço de interesse é obrigatório.' })
  service: string;

  @IsString()
  @IsNotEmpty({ message: 'A mensagem não pode estar vazia.' })
  message: string;
}