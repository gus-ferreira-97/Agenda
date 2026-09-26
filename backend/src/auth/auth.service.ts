import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserService } from '../user/user.service';
import { TenantService } from '../tenant/tenant.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from '../mail/mail.service';

/**
 * Mensagens de erro para status de tenant que impedem login.
 * Centralizadas aqui para fácil manutenção.
 */
const TENANT_STATUS_MESSAGES: Record<string, string> = {
  pendente:
    'Sua conta ainda está em análise. Você receberá um e-mail quando for ativada.',
  suspenso: 'Sua conta está suspensa. Entre em contato com o suporte.',
  trial_expirado:
    'Seu período de teste terminou. Entre em contato para ativar sua assinatura.',
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tenantService: TenantService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  // ============================================================================
  // LOGIN
  // ============================================================================

  /**
   * Orquestra a validação completa de login.
   * Cada etapa é delegada a um método privado com responsabilidade única.
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    this.checkUserActive(user);
    await this.checkLockout(user);
    await this.validatePassword(user, password);
    this.checkEmailVerified(user);
    await this.checkTenantStatus(user);

    const { password_hash, ...result } = user;
    return result;
  }

  /**
   * Valida se o usuário pode logar a partir do subdomínio da requisição.
   * Regras:
   *  - super_admin: pode logar de qualquer subdomínio (gerencia todos os tenants)
   *  - tenant_admin: só pode logar do subdomínio do seu próprio tenant
   *  - localhost puro (sem subdomínio): bloqueado para tenant_admin
   */
  async validateSubdomainAccess(
    user: any,
    subdomain: string | null,
  ): Promise<void> {
    if (user.role === 'super_admin') {
      return;
    }

    if (!subdomain) {
      throw new UnauthorizedException(
        'Faça login pelo subdomínio da sua conta.',
      );
    }

    if (!user.tenant_id) {
      throw new UnauthorizedException(
        'Sua conta não está vinculada a nenhum estabelecimento.',
      );
    }

    const userTenant = await this.tenantService.findOne(user.tenant_id);

    if (!userTenant || userTenant.subdomain !== subdomain) {
      throw new UnauthorizedException(
        'Esta conta não pertence a este workspace. Acesse pelo subdomínio correto.',
      );
    }
  }

  async login(user: any, rememberMe: boolean = false) {
    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenant_id,
    };

    const expiresIn = rememberMe ? '7d' : '1h';

    return {
      access_token: this.jwtService.sign(payload, { expiresIn }),
    };
  }

  // ============================================================================
  // RECUPERAÇÃO DE SENHA
  // ============================================================================

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.userService.findByEmail(dto.email);

    const successMessage =
      'Se o e-mail estiver cadastrado, enviaremos um link para redefinir sua senha.';

    if (!user) {
      return { message: successMessage };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    await this.userService.setResetToken(user.email, token, expires);
    await this.mailService.sendPasswordResetEmail(user.email, token);

    return { message: successMessage };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.userService.findByResetToken(dto.token);

    if (!user) {
      throw new BadRequestException('Token inválido');
    }

    if (
      !user.reset_password_expires ||
      user.reset_password_expires < new Date()
    ) {
      // Token expirado — limpa do banco para não deixar lixo
      await this.userService.clearResetToken(user.id);
      throw new BadRequestException('Token expirado. Solicite um novo link.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.userService.updatePassword(user.id, hashedPassword);

    return { message: 'Senha redefinida com sucesso!' };
  }

  // ============================================================================
  // MÉTODOS PRIVADOS — VALIDAÇÕES DE LOGIN
  // ============================================================================

  private checkUserActive(user: any): void {
    if (!user.is_active) {
      throw new UnauthorizedException('Esta conta não está mais ativa.');
    }
  }

  /**
   * Verifica se a conta está bloqueada por excesso de tentativas.
   * Se o bloqueio expirou, reseta o contador e continua o fluxo.
   */
  private async checkLockout(user: any): Promise<void> {
    if (user.locked_until && user.locked_until > new Date()) {
      const minutesLeft = Math.ceil(
        (user.locked_until.getTime() - Date.now()) / 60000,
      );
      throw new ForbiddenException(
        `Conta temporariamente bloqueada por excesso de tentativas. Tente novamente em ${minutesLeft} minuto(s).`,
      );
    }

    if (user.locked_until && user.locked_until <= new Date()) {
      await this.userService.resetFailedLogin(user.id);
      user.failed_login_attempts = 0;
      user.locked_until = null;
    }
  }

  /**
   * Valida a senha via bcrypt.
   * Se inválida, incrementa o contador de tentativas falhas.
   * Se válida e havia tentativas anteriores, reseta o contador.
   */
  private async validatePassword(user: any, password: string): Promise<void> {
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      const result = await this.userService.incrementFailedLogin(user.id);

      if (result.locked) {
        throw new ForbiddenException(
          'Conta temporariamente bloqueada por excesso de tentativas. Tente novamente em 15 minuto(s).',
        );
      }

      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (user.failed_login_attempts > 0 || user.locked_until) {
      await this.userService.resetFailedLogin(user.id);
    }
  }

  private checkEmailVerified(user: any): void {
    if (!user.email_verified) {
      throw new ForbiddenException(
        'Confirme seu e-mail antes de fazer login. Verifique sua caixa de entrada.',
      );
    }
  }

  /**
   * Verifica se o tenant do usuário está em estado que permite login.
   * Só se aplica a tenant_admin (super_admin não tem tenant).
   */
  private async checkTenantStatus(user: any): Promise<void> {
    if (user.role !== 'tenant_admin' || !user.tenant_id) {
      return;
    }

    const tenant = await this.tenantService.findOne(user.tenant_id);

    if (!tenant) {
      throw new UnauthorizedException('Tenant não encontrado');
    }

    if (tenant.status !== 'ativo') {
      throw new ForbiddenException(
        TENANT_STATUS_MESSAGES[tenant.status] ||
          'Sua conta não está ativa. Entre em contato com o suporte.',
      );
    }
  }
}