import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyEmailDto {
  @IsString({ message: 'O token deve ser um texto válido' })
  @IsNotEmpty({ message: 'Informe o token de verificação' })
  token: string;
}