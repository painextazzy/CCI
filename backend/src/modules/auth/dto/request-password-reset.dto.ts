import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestPasswordResetDto {
  @IsEmail({}, { message: 'Adresse e-mail invalide' })
  @IsNotEmpty({ message: "L'e-mail est requis" })
  email: string;
}
