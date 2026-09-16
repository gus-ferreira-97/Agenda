import { applyDecorators } from '@nestjs/common';
import { Matches, MaxLength, MinLength } from 'class-validator';

export function IsStrongPassword() {
  return applyDecorators(
    MinLength(8, {
      message: 'A senha deve ter pelo menos 8 caracteres',
    }),
    MaxLength(128, {
      message: 'A senha deve ter no máximo 128 caracteres',
    }),
    Matches(/[A-Z]/, {
      message: 'A senha deve conter pelo menos uma letra maiúscula',
    }),
    Matches(/[a-z]/, {
      message: 'A senha deve conter pelo menos uma letra minúscula',
    }),
    Matches(/[0-9]/, {
      message: 'A senha deve conter pelo menos um número',
    }),
    Matches(/[^A-Za-z0-9]/, {
      message: 'A senha deve conter pelo menos um caractere especial',
    }),
    Matches(/^\S+$/, {
      message: 'A senha não pode conter espaços',
    }),
  );
}