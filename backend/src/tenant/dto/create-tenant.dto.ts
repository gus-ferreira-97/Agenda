import { IsString, IsNotEmpty, Length, IsOptional } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  subdomain: string;

  @IsOptional()
  @IsString()
  @Length(2, 20)
  status?: string; // opcional, padrão será 'ativo'
}