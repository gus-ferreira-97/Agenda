import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * Campos que NUNCA devem sair da API.
 * - password_hash: credencial
 * - reset_password_token/expires: permite sequestrar reset de senha
 * - email_verification_token/expires: permite verificar e-mail alheio
 */
type SensitiveFields =
  | 'password_hash'
  | 'reset_password_token'
  | 'reset_password_expires'
  | 'email_verification_token'
  | 'email_verification_expires';

type SafeUser = Omit<User, SensitiveFields>;

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutos
const BCRYPT_ROUNDS = 10;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ============================================================================
  // CRUD (super_admin)
  // ============================================================================

  async create(dto: CreateUserDto): Promise<SafeUser> {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password_hash: hashedPassword,
      role: dto.role,
      tenant_id: dto.tenantId ?? null,
    });

    const savedUser = await this.userRepository.save(user);
    return this.toSafeUser(savedUser);
  }

  async findAll(): Promise<SafeUser[]> {
    const users = await this.userRepository.find({ relations: ['tenant'] });
    return users.map((user) => this.toSafeUser(user));
  }

  async findOne(id: number): Promise<SafeUser> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    return this.toSafeUser(user);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user || undefined;
  }

  async update(
    id: number,
    dto: UpdateUserDto,
    requestingUser: any,
  ): Promise<SafeUser> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    // Bloqueio de escalação de privilégios
    if (dto.role !== undefined && dto.role !== user.role) {
      if (requestingUser?.role !== 'super_admin') {
        throw new ForbiddenException(
          'Apenas super administradores podem alterar o papel de um usuário.',
        );
      }
    }

    // Bloqueio de mudança de tenant
    if (dto.tenantId !== undefined && dto.tenantId !== user.tenant_id) {
      if (requestingUser?.role !== 'super_admin') {
        throw new ForbiddenException(
          'Apenas super administradores podem mover usuários entre tenants.',
        );
      }
    }

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.tenantId !== undefined) user.tenant_id = dto.tenantId ?? null;

    if (dto.password) {
      user.password_hash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
      user.reset_password_token = null;
      user.reset_password_expires = null;
    }

    const updatedUser = await this.userRepository.save(user);
    return this.toSafeUser(updatedUser);
  }

  async remove(id: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    if (user.role === 'super_admin') {
      throw new ForbiddenException(
        'Não é possível excluir um usuário Super Admin. Altere o papel dele antes de excluir.',
      );
    }

    await this.userRepository.softDelete(id);
    return { message: 'Usuário excluído com sucesso.' };
  }

  // ============================================================================
  // SELF-SERVICE (próprio usuário)
  // ============================================================================

  async findMe(id: number): Promise<SafeUser> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    return this.toSafeUser(user);
  }

  async updateMe(
    id: number,
    dto: { name?: string; email?: string },
  ): Promise<SafeUser> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepository.findOne({
        where: { email: dto.email },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Este e-mail já está em uso por outra conta');
      }
      user.email = dto.email;
    }

    if (dto.name !== undefined) {
      user.name = dto.name;
    }

    const updated = await this.userRepository.save(user);
    return this.toSafeUser(updated);
  }

  async changePassword(
    id: number,
    dto: { currentPassword: string; newPassword: string },
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password_hash,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'A nova senha deve ser diferente da senha atual',
      );
    }

    user.password_hash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    user.reset_password_token = null;
    user.reset_password_expires = null;
    await this.userRepository.save(user);

    return { message: 'Senha alterada com sucesso.' };
  }

  // ============================================================================
  // TOKENS DE RESET DE SENHA (usados pelo AuthService)
  // ============================================================================

  async setResetToken(
    email: string,
    token: string,
    expires: Date,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return; // não revela se o e-mail existe

    user.reset_password_token = token;
    user.reset_password_expires = expires;
    await this.userRepository.save(user);
  }

  async clearResetToken(userId: number): Promise<void> {
    await this.userRepository.update(userId, {
      reset_password_token: null,
      reset_password_expires: null,
    });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { reset_password_token: token },
    });
  }

  async updatePassword(userId: number, newPasswordHash: string): Promise<void> {
    await this.userRepository.update(userId, {
      password_hash: newPasswordHash,
      reset_password_token: null,
      reset_password_expires: null,
    });
  }

  // ============================================================================
  // CONTROLE DE TENTATIVAS DE LOGIN
  // ============================================================================

  async incrementFailedLogin(
    userId: number,
  ): Promise<{ attempts: number; locked: boolean }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return { attempts: 0, locked: false };

    user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;

    if (user.failed_login_attempts >= MAX_LOGIN_ATTEMPTS) {
      user.locked_until = new Date(Date.now() + LOCK_DURATION_MS);
    }

    await this.userRepository.save(user);

    return {
      attempts: user.failed_login_attempts,
      locked: user.locked_until !== null && user.locked_until > new Date(),
    };
  }

  async resetFailedLogin(userId: number): Promise<void> {
    await this.userRepository.update(userId, {
      failed_login_attempts: 0,
      locked_until: null,
    });
  }

  // ============================================================================
  // LGPD — ANONIMIZAÇÃO
  // ============================================================================

  async anonymizeAndDeactivate(
    userId: number,
    requestingUser: any,
  ): Promise<{ message: string }> {
    // withDeleted: encontra usuários já soft-deletados (idempotência)
    const user = await this.userRepository.findOne({
      where: { id: userId },
      withDeleted: true,
    });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Impede que o super admin se auto-exclua
    if (user.role === 'super_admin' && userId === requestingUser.userId) {
      throw new ForbiddenException(
        'Super administradores não podem excluir a própria conta. Peça a outro super admin.',
      );
    }

    // Se já foi removido, retorna mensagem amigável
    if (user.deleted_at || (!user.is_active && user.email.startsWith('deleted_'))) {
      return { message: 'Esta conta já foi removida.' };
    }

    // Anonimiza dados pessoais (LGPD art. 18)
    user.name = 'Usuário removido';
    user.email = `deleted_${user.id}@removed.local`;
    user.password_hash = 'DELETED_ACCOUNT_NO_LOGIN';
    user.reset_password_token = null;
    user.reset_password_expires = null;
    user.email_verification_token = null;
    user.email_verification_expires = null;
    user.failed_login_attempts = 0;
    user.locked_until = null;
    user.is_active = false;
    user.deleted_at = new Date();

    await this.userRepository.save(user);

    return {
      message:
        'Sua conta foi removida. Os dados pessoais foram anonimizados conforme a LGPD.',
    };
  }

  // ============================================================================
  // HELPERS PRIVADOS
  // ============================================================================

  /**
   * Remove todos os campos sensíveis de um User antes de retornar à API.
   * Aplica em TODOS os métodos que retornam User.
   */
  private toSafeUser(user: User): SafeUser {
    const {
      password_hash,
      reset_password_token,
      reset_password_expires,
      email_verification_token,
      email_verification_expires,
      ...safe
    } = user;
    return safe as SafeUser;
  }
}