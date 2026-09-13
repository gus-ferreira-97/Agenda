import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsIn,
  Matches,
} from 'class-validator';

export class CreateTenantDto {
  @IsString({ message: 'O nome deve ser um texto válido' })
  @IsNotEmpty({ message: 'Informe o nome do estabelecimento' })
  @Length(3, 255, {
    message: 'O nome deve ter entre 3 e 255 caracteres',
  })
  name: string;

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
  @IsString({ message: 'O status deve ser um texto válido' })
  @Length(2, 20, {
    message: 'O status deve ter entre 2 e 20 caracteres',
  })
  status?: string;

  @IsOptional()
  @IsIn(['basico', 'profissional', 'premium'], {
    message: 'O plano deve ser: básico, profissional ou premium',
  })
  plan?: string;
}