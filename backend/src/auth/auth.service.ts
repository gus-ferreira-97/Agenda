import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserService } from '../user/user.service';
import { Tenant } from '../tenant/entities/tenant.entity';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Esta conta não está mais ativa.');
    }

    // ========== Verifica se a conta está bloqueada ==========
    if (user.locked_until && user.locked_until > new Date()) {
      const minutesLeft = Math.ceil(
        (user.locked_until.getTime() - Date.now()) / 60000,
      );
      throw new ForbiddenException(
        `Conta temporariamente bloqueada por excesso de tentativas. Tente novamente em ${minutesLeft} minuto(s).`,
      );
    }

    // Se o bloqueio expirou, reseta antes de continuar
    if (user.locked_until && user.locked_until <= new Date()) {
      await this.userService.resetFailedLogin(user.id);
      user.failed_login_attempts = 0;
      user.locked_until = null;
    }

    // ========== Valida a senha ==========
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

    // ========== Login correto: reseta contador se necessário ==========
    if (user.failed_login_attempts > 0 || user.locked_until) {
      await this.userService.resetFailedLogin(user.id);
    }

    // ========== Verifica e-mail confirmado ==========
    if (!user.email_verified) {
      throw new ForbiddenException(
        'Confirme seu e-mail antes de fazer login. Verifique sua caixa de entrada.',
      );
    }

    // ========== Verifica status do tenant ==========
    if (user.role === 'tenant_admin' && user.tenant_id) {
      const tenant = await this.tenantRepository.findOne({
        where: { id: user.tenant_id },
      });

      if (!tenant) {
        throw new UnauthorizedException('Tenant não encontrado');
      }

      if (tenant.status === 'pendente') {
        throw new ForbiddenException(
          'Sua conta ainda está em análise. Você receberá um e-mail quando for ativada.',
        );
      }

      if (tenant.status === 'suspenso') {
        throw new ForbiddenException(
          'Sua conta está suspensa. Entre em contato com o suporte.',
        );
      }

      if (tenant.status === 'trial_expirado') {
        throw new ForbiddenException(
          'Seu período de teste terminou. Entre em contato para ativar sua assinatura.',
        );
      }

      if (tenant.status !== 'ativo') {
        throw new ForbiddenException(
          'Sua conta não está ativa. Entre em contato com o suporte.',
        );
      }
    }

    const { password_hash, ...result } = user;
    return result;
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

    if (!user.reset_password_expires || user.reset_password_expires < new Date()) {
      // Limpa o token expirado
      await this.userService.updatePassword(user.id, user.password_hash);
      throw new BadRequestException('Token expirado. Solicite um novo link.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.userService.updatePassword(user.id, hashedPassword);

    return { message: 'Senha redefinida com sucesso!' };
  }
}