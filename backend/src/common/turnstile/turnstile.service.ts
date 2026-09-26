import {
  Injectable,
  BadRequestException,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

@Injectable()
export class TurnstileService {
  private readonly logger = new Logger(TurnstileService.name);
  private readonly secretKey: string;
  private readonly verifyUrl =
    'https://challenges.cloudflare.com/turnstile/v0/siteverify';

  constructor(private readonly configService: ConfigService) {
    const secret = this.configService.get<string>('TURNSTILE_SECRET_KEY');
    if (!secret || secret.trim() === '') {
      throw new Error(
        'TURNSTILE_SECRET_KEY não está configurada. Defina no .env.',
      );
    }
    this.secretKey = secret;
  }

  /**
   * Valida um token do Cloudflare Turnstile.
   * Lança BadRequestException se o token for inválido.
   */
  async validateToken(token: string, remoteIp?: string): Promise<void> {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      throw new BadRequestException('Token de CAPTCHA ausente.');
    }

    const formData = new URLSearchParams();
    formData.append('secret', this.secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    try {
      const response = await fetch(this.verifyUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        this.logger.error(
          `Falha ao contatar a Cloudflare: HTTP ${response.status}`,
        );
        throw new ServiceUnavailableException(
          'Serviço de verificação indisponível. Tente novamente em instantes.',
        );
      }

      const data = (await response.json()) as TurnstileResponse;

      if (!data.success) {
        this.logger.warn(
          `Token Turnstile rejeitado: ${JSON.stringify(data['error-codes'] || [])}`,
        );
        throw new BadRequestException(
          'CAPTCHA inválido ou expirado. Recarregue a página e tente novamente.',
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(
        `Erro de comunicação com Cloudflare: ${(error as Error).message}`,
      );
      throw new ServiceUnavailableException(
        'Serviço de verificação indisponível. Tente novamente em instantes.',
      );
    }
  }
}