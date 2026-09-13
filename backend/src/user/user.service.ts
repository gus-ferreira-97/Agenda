import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
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
}
