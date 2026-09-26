import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

// Cor principal (violet-600 do Tailwind) para todos os templates
const PRIMARY_COLOR = '#7c3aed';
const PRIMARY_COLOR_DARK = '#6d28d9';
const TEXT_MUTED = '#6b7280';
const BORDER_COLOR = '#e5e7eb';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend | null = null;
  private readonly from: string;
  private readonly frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');

    this.from =
      this.configService.get<string>('MAIL_FROM') ||
      'Agendy <no-reply@agendy.com.br>';

    // ============ FRONTEND_URL com fail-fast em produção REAL ============
    // DEPLOY_ENV=prod é setada APENAS no servidor de produção.
    // No WSL/local, deixamos como 'local' (default) para permitir localhost.
    const deployEnv = this.configService.get<string>('DEPLOY_ENV') || 'local';
    const isRealProduction = deployEnv === 'prod';

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    if (!frontendUrl || frontendUrl.trim() === '') {
      if (isRealProduction) {
        throw new Error(
          'FRONTEND_URL não configurada em produção. Defina no .env.',
        );
      }
      this.frontendUrl = 'http://localhost:5173';
    } else if (isRealProduction && frontendUrl.includes('localhost')) {
      throw new Error(
        `FRONTEND_URL aponta para localhost em produção ("${frontendUrl}"). Configure o domínio real no .env.`,
      );
    } else {
      this.frontendUrl = frontendUrl;
    }

    if (apiKey && apiKey.trim() !== '') {
      this.resend = new Resend(apiKey);
      this.logger.log('MailService configurado com Resend');
    } else {
      this.logger.warn(
        'RESEND_API_KEY não configurada. E-mails serão apenas logados no console.',
      );
    }
  }

  private async send(
    to: string,
    subject: string,
    html: string,
    fallbackLink?: string,
  ): Promise<void> {
    if (this.resend) {
      try {
        await this.resend.emails.send({
          from: this.from,
          to,
          subject,
          html,
        });
        this.logger.log(`E-mail enviado para ${to} - "${subject}"`);
      } catch (error) {
        this.logger.error(`Falha ao enviar e-mail para ${to}`, error);
      }
    } else {
      if (process.env.NODE_ENV !== 'production') {
        this.logger.log('==== E-MAIL (MODO DESENVOLVIMENTO) ====');
        this.logger.log(`Para: ${to}`);
        this.logger.log(`Assunto: ${subject}`);
        if (fallbackLink) {
          this.logger.log(`Link: ${fallbackLink}`);
        }
        this.logger.log('========================================');
      } else {
        this.logger.warn(
          `RESEND_API_KEY não configurada em produção. E-mail para ${to} NÃO foi enviado.`,
        );
      }
    }
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetLink = `${this.frontendUrl}/redefinir-senha?token=${token}`;
    const subject = 'Redefinição de senha - Agendy';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${PRIMARY_COLOR};">Redefinição de senha</h2>
        <p>Olá,</p>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Agendy</strong>.</p>
        <p>Clique no botão abaixo para criar uma nova senha:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}"
             style="background-color: ${PRIMARY_COLOR}; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Redefinir senha
          </a>
        </p>
        <p>Ou copie e cole o link abaixo no navegador:</p>
        <p style="word-break: break-all; color: ${PRIMARY_COLOR};">${resetLink}</p>
        <p><strong>Este link expira em 10 minutos.</strong></p>
        <p>Se você não solicitou essa redefinição, ignore este e-mail.</p>
        <hr style="border: none; border-top: 1px solid ${BORDER_COLOR}; margin: 30px 0;" />
        <p style="color: ${TEXT_MUTED}; font-size: 12px;">
          Este é um e-mail automático, não responda.<br />
          Agendy - Agenda online para profissionais da beleza
        </p>
      </div>
    `;

    await this.send(to, subject, html, resetLink);
  }

  async sendEmailVerificationEmail(to: string, token: string): Promise<void> {
    const verifyLink = `${this.frontendUrl}/verificar-email?token=${token}`;
    const subject = 'Confirme seu e-mail - Agendy';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${PRIMARY_COLOR};">Bem-vindo ao Agendy!</h2>
        <p>Olá,</p>
        <p>Estamos quase lá! Para ativar sua conta e começar a usar o Agendy, confirme seu e-mail clicando no botão abaixo:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verifyLink}"
             style="background-color: ${PRIMARY_COLOR}; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Confirmar meu e-mail
          </a>
        </p>
        <p>Ou copie e cole o link abaixo no navegador:</p>
        <p style="word-break: break-all; color: ${PRIMARY_COLOR};">${verifyLink}</p>
        <p><strong>Este link expira em 24 horas.</strong></p>
        <p>Se você não se cadastrou no Agendy, ignore este e-mail.</p>
        <hr style="border: none; border-top: 1px solid ${BORDER_COLOR}; margin: 30px 0;" />
        <p style="color: ${TEXT_MUTED}; font-size: 12px;">
          Este é um e-mail automático, não responda.<br />
          Agendy - Agenda online para profissionais da beleza
        </p>
      </div>
    `;

    await this.send(to, subject, html, verifyLink);
  }
}