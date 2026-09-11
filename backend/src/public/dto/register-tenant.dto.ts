import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  Length,
  Matches,
} from 'class-validator';

export class RegisterTenantDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  ownerName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  tenantName: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'O subdomínio deve conter apenas letras minúsculas, números e hífens',
  })
  subdomain: string;
}