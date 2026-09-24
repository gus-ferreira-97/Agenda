import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { email: createUserDto.email } });
    if (existing) {
      throw new ConflictException('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password_hash: hashedPassword,
      role: createUserDto.role,
      tenant_id: createUserDto.tenantId ?? null,
    });

    const savedUser = await this.userRepository.save(user);
    const { password_hash, ...result } = savedUser;
    return result as User;
  }

  async findAll(): Promise<any[]> {
    const users = await this.userRepository.find({ relations: ['tenant'] });
    return users.map(({ password_hash, ...user }) => user);
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    const { password_hash, ...result } = user;
    return result as User;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user || undefined;
  }

  async update(id: number, updateUserDto: UpdateUserDto, requestingUser: any): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    // ========== Bloqueio de escalação de privilégios ==========
    // Apenas super_admin pode alterar o papel de um usuário
    if (updateUserDto.role !== undefined && updateUserDto.role !== user.role) {
      if (requestingUser?.role !== 'super_admin') {
        throw new ForbiddenException(
          'Apenas super administradores podem alterar o papel de um usuário.',
        );
      }
    }

    // Apenas super_admin pode mover um usuário entre tenants
    if (
      updateUserDto.tenantId !== undefined &&
      updateUserDto.tenantId !== user.tenant_id
    ) {
      if (requestingUser?.role !== 'super_admin') {
        throw new ForbiddenException(
          'Apenas super administradores podem mover usuários entre tenants.',
        );
      }
    }

    // ========== Aplica as alterações ==========
    if (updateUserDto.name !== undefined) user.name = updateUserDto.name;
    if (updateUserDto.email !== undefined) user.email = updateUserDto.email;
    if (updateUserDto.role !== undefined) user.role = updateUserDto.role;

    if (updateUserDto.tenantId !== undefined) {
      user.tenant_id = updateUserDto.tenantId ?? null;
    }

    if (updateUserDto.password) {
      user.password_hash = await bcrypt.hash(updateUserDto.password, 10);
      user.reset_password_token = null;
      user.reset_password_expires = null;
    }

    const updatedUser = await this.userRepository.save(user);
    const { password_hash, reset_password_token, reset_password_expires, ...result } = updatedUser;
    return result as User;
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

    await this.userRepository.delete(id);
    return { message: 'Usuário excluído com sucesso.' };
  }

  async setResetToken(email: string, token: string, expires: Date): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return; // não revela se o e-mail existe

    user.reset_password_token = token;
    user.reset_password_expires = expires;
    await this.userRepository.save(user);
  }

  async setEmailVerificationToken(email: string, token: string, expires: Date): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return;

    user.email_verification_token = token;
    user.email_verification_expires = expires;
    await this.userRepository.save(user);
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email_verification_token: token },
    });
  }

  async markEmailAsVerified(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return;

    user.email_verified = true;
    user.email_verification_token = null;
    user.email_verification_expires = null;
    await this.userRepository.save(user);
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { reset_password_token: token },
    });
  }

  async updatePassword(userId: number, newPasswordHash: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return;

    user.password_hash = newPasswordHash;
    user.reset_password_token = null;
    user.reset_password_expires = null;

    await this.userRepository.save(user);
  }

  async findMe(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    const { password_hash, reset_password_token, reset_password_expires, ...result } = user;
    return result as User;
  }

  async updateMe(id: number, dto: { name?: string; email?: string }): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    // Se estiver trocando o e-mail, verifica se já está em uso por outro usuário
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
    const { password_hash, reset_password_token, reset_password_expires, ...result } = updated;
    return result as User;
  }

  async changePassword(
    id: number,
    dto: { currentPassword: string; newPassword: string },
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('A nova senha deve ser diferente da senha atual');
    }

    user.password_hash = await bcrypt.hash(dto.newPassword, 10);
    user.reset_password_token = null;
    user.reset_password_expires = null;
    await this.userRepository.save(user);

    return { message: 'Senha alterada com sucesso.' };
  }

  async incrementFailedLogin(userId: number): Promise<{ attempts: number; locked: boolean }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return { attempts: 0, locked: false };

    user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;

    const MAX_ATTEMPTS = 5;
    const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutos

    if (user.failed_login_attempts >= MAX_ATTEMPTS) {
      user.locked_until = new Date(Date.now() + LOCK_DURATION_MS);
    }

    await this.userRepository.save(user);

    return {
      attempts: user.failed_login_attempts,
      locked: user.locked_until !== null && user.locked_until > new Date(),
    };
  }

  async resetFailedLogin(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return;

    user.failed_login_attempts = 0;
    user.locked_until = null;
    await this.userRepository.save(user);
  }

  async anonymizeAndDeactivate(userId: number, requestingUser: any): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
    }

    // Impede que o super admin se auto-exclua
    if (user.role === 'super_admin' && userId === requestingUser.userId) {
      throw new ForbiddenException(
        'Super administradores não podem excluir a própria conta. Peça a outro super admin.',
      );
    }

    // Se o usuário já foi anonimizado, retorna mensagem amigável
    if (!user.is_active && user.email.startsWith('deleted_')) {
      return { message: 'Esta conta já foi removida.' };
    }

    // Anonimiza os dados
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

    await this.userRepository.save(user);

    return {
      message:
        'Sua conta foi removida. Os dados pessoais foram anonimizados conforme a LGPD.',
    };
  }
}
