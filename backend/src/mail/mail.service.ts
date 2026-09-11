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
    this.from = this.configService.get<string>('MAIL_FROM') || 'AgendaApp <no-reply@agendaapp.com.br>';
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
      // Modo desenvolvimento: apenas loga
      this.logger.log('==== E-MAIL (MODO DESENVOLVIMENTO) ====');
      this.logger.log(`Para: ${to}`);
      this.logger.log(`Assunto: ${subject}`);
      if (fallbackLink) {
        this.logger.log(`Link: ${fallbackLink}`);
      }
      this.logger.log('========================================');
    }
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetLink = `${this.frontendUrl}/redefinir-senha?token=${token}`;
    const subject = 'Redefinição de senha - AgendaApp';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Redefinição de senha</h2>
        <p>Olá,</p>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>AgendaApp</strong>.</p>
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
          AgendaApp - Agenda online para profissionais da beleza
        </p>
      </div>
    `;

    await this.send(to, subject, html, resetLink);
  }
}