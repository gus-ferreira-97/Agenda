import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
  Min,
  MaxLength,
  MinLength,
  IsBoolean,
} from 'class-validator';

export class CreateServiceOptionDto {
  @IsInt({ message: 'O serviço é inválido' })
  serviceId: number;

  @IsString({ message: 'O nome deve ser um texto válido' })
  @IsNotEmpty({ message: 'Informe o nome da variação' })
  @MinLength(2, { message: 'O nome deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres' })
  name: string;

  @IsOptional()
  @IsString({ message: 'A descrição deve ser um texto válido' })
  @MaxLength(1000, { message: 'A descrição deve ter no máximo 1000 caracteres' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'A URL da imagem deve ser um texto válido' })
  @MaxLength(500, { message: 'A URL da imagem deve ter no máximo 500 caracteres' })
  imageUrl?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'O preço deve ser um número válido com até 2 casas decimais' })
  @Min(0, { message: 'O preço não pode ser negativo' })
  price?: number;

  @IsOptional()
  @IsInt({ message: 'A duração deve ser um número inteiro' })
  @Min(1, { message: 'A duração deve ser maior que zero' })
  durationMinutes?: number;

  @IsOptional()
  @IsBoolean({ message: 'O status ativo deve ser verdadeiro ou falso' })
  isActive?: boolean;

  @IsOptional()
  @IsInt({ message: 'A ordem de exibição deve ser um número inteiro' })
  sortOrder?: number;
}