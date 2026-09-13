import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsIn,
  IsOptional,
  MinLength,
  Length,
  Matches,
} from 'class-validator';

export class RegisterTenantDto {
  @IsString({ message: 'O nome deve ser um texto válido' })
  @IsNotEmpty({ message: 'Informe seu nome' })
  @Length(3, 255, {
    message: 'O nome deve ter entre 3 e 255 caracteres',
  })
  ownerName: string;

  @IsEmail({}, { message: 'Informe um e-mail válido' })
  @IsNotEmpty({ message: 'Informe seu e-mail' })
  email: string;

  @IsString({ message: 'A senha deve ser um texto válido' })
  @MinLength(6, {
    message: 'A senha deve ter pelo menos 6 caracteres',
  })
  password: string;

  @IsString({ message: 'O nome do estabelecimento deve ser um texto válido' })
  @IsNotEmpty({ message: 'Informe o nome do estabelecimento' })
  @Length(3, 255, {
    message: 'O nome do estabelecimento deve ter entre 3 e 255 caracteres',
  })
  tenantName: string;

  @IsString({ message: 'O subdomínio deve ser um texto válido' })
  @IsNotEmpty({ message: 'Informe o subdomínio' })
  @Length(3, 100, {
    message: 'O subdomínio deve ter entre 3 e 100 caracteres',
  })
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message:
      'O subdomínio deve conter apenas letras minúsculas, números e hífens (não pode começar/terminar com hífen nem ter hífens seguidos)',
  })
  subdomain: string;

  @IsOptional()
  @IsIn(['basico', 'profissional', 'premium'], {
    message: 'O plano deve ser: básico, profissional ou premium',
  })
  plan?: string;
}