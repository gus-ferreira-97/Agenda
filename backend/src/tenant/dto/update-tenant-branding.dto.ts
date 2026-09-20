import {
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import { SanitizeHtml } from '../../common/validators/sanitize-html.decorator';

export class UpdateTenantBrandingDto {
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'primaryColor deve estar no formato hexadecimal (ex.: #2563eb)',
  })
  primaryColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @SanitizeHtml()
  welcomeMessage?: string;

  @IsOptional()
  @IsString()
  @Length(8, 20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @SanitizeHtml()
  address?: string;
}