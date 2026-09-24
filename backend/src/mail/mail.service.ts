import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend | null = null;
  private readonly from: string;
  private readonly frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.from = this.configService.get<string>('MAIL_FROM') || 'Agendy <no-reply@agendy.com.br>';
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';

    if (apiKey && apiKey.trim() !== '') {
      this.resend = new Resend(apiKey);
      this.logger.log('MailService configurado com Resend');
    } else {
      this.logger.warn('RESEND_API_KEY não configurada. E-mails serão apenas logados no console.');
    }
  }

  private async send(to: string, subject: string, html: string, fallbackLink?: string): Promise<void> {
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
      // Modo desenvolvimento: apenas loga (nunca em produção)
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
        <h2 style="color: #2563eb;">Redefinição de senha</h2>
        <p>Olá,</p>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Agendy</strong>.</p>
        <p>Clique no botão abaixo para criar uma nova senha:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}"
             style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Redefinir senha
          </a>
        </p>
        <p>Ou copie e cole o link abaixo no navegador:</p>
        <p style="word-break: break-all; color: #2563eb;">${resetLink}</p>
        <p><strong>Este link expira em 10 minutos.</strong></p>
        <p>Se você não solicitou essa redefinição, ignore este e-mail.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="color: #6b7280; font-size: 12px;">
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
        <h2 style="color: #2563eb;">Bem-vindo ao Agendy!</h2>
        <p>Olá,</p>
        <p>Estamos quase lá! Para ativar sua conta e começar a usar o Agendy, confirme seu e-mail clicando no botão abaixo:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verifyLink}"
             style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Confirmar meu e-mail
          </a>
        </p>
        <p>Ou copie e cole o link abaixo no navegador:</p>
        <p style="word-break: break-all; color: #2563eb;">${verifyLink}</p>
        <p><strong>Este link expira em 24 horas.</strong></p>
        <p>Se você não se cadastrou no Agendy, ignore este e-mail.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="color: #6b7280; font-size: 12px;">
          Este é um e-mail automático, não responda.<br />
          Agendy - Agenda online para profissionais da beleza
        </p>
      </div>
    `;

    await this.send(to, subject, html, verifyLink);
  }
}