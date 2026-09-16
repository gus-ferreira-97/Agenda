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

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    if (updateUserDto.name) user.name = updateUserDto.name;
    if (updateUserDto.email) user.email = updateUserDto.email;
    if (updateUserDto.role) user.role = updateUserDto.role;

    if (updateUserDto.tenantId !== undefined) {
      user.tenant_id = updateUserDto.tenantId ?? null;
    }

    if (updateUserDto.password) {
      user.password_hash = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userRepository.save(user);
    const { password_hash, ...result } = updatedUser;
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
}
