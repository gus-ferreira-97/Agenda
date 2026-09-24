import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import * as Sentry from '@sentry/nestjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Se a rota é pública, pula a verificação de JWT
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token não fornecido');
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtService.verify(token);
      request.user = {
        userId: payload.sub,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        tenantId: payload.tenantId,
      };

      // ============ Sentry: associa o usuário ao escopo da requisição ============
      // Qualquer erro capturado depois vai ter esses dados anexados
      Sentry.setUser({
        id: String(payload.sub),
        email: payload.email,
        username: payload.name,
      });
      Sentry.setTag('role', payload.role);
      if (payload.tenantId) {
        Sentry.setTag('tenantId', String(payload.tenantId));
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}