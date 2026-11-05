import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { CompanyType } from '../../companies/entities/company.entity';

export class RegisterCompanyDto {
  @IsEmail({}, { message: 'Adresse e-mail invalide' })
  @IsNotEmpty({ message: "L'e-mail est requis" })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  password: string;

  @IsEnum(CompanyType, { message: "Type d'entreprise invalide" })
  companyType: CompanyType;

  @IsString()
  @IsNotEmpty({ message: "Le nom de l'entreprise est requis" })
  companyName: string;

  @IsString()
  @IsNotEmpty({ message: 'Le NIF est requis' })
  nif: string;

  @IsString()
  @IsNotEmpty({ message: 'Le STAT est requis' })
  stat: string;



  @IsString()
  @IsNotEmpty({ message: "L'adresse est requise" })
  address: string;

  @IsString()
  @IsNotEmpty({ message: 'Le nom du responsable est requis' })
  managerName: string;

  @IsString()
  @IsNotEmpty({ message: 'La fonction du responsable est requise' })
  managerRole: string;

  @IsString()
  @IsNotEmpty({ message: 'Le numéro de téléphone est requis' })
  phone: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsString()
  @IsNotEmpty({ message: 'Le secteur d’activité est requis' })
  sector: string;

  @IsOptional()
  @IsString()
  sectorOther?: string;

  @IsString()
  @IsNotEmpty({ message: 'La description des besoins est requise' })
  needsDescription: string;

  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  @IsBoolean({ message: 'Vous devez accepter les conditions d’utilisation' })
  agreedTerms: boolean;
}