import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * ThrottlerGuard customizado que usa o tenantId (do JWT) como chave de rate limit.
 *
 * Ordem de prioridade para o tracker:
 *   1. req.user.tenantId / req.user.userId (se um guard anterior já populou)
 *   2. req.tenantId (resolvido pelo TenantMiddleware em /public/*)
 *   3. Payload do JWT decodificado (sem verificar assinatura — o JwtAuthGuard
 *      verifica logo depois. Aqui só usamos o payload para escolher o bucket)
 *   4. Fallback: IP
 */
@Injectable()
export class TenantThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // 1. Usuário já autenticado por um guard anterior
    if (req.user?.tenantId) {
      return `tenant:${req.user.tenantId}`;
    }
    if (req.user?.userId && req.user?.role === 'super_admin') {
      return `user:${req.user.userId}`;
    }

    // 2. TenantMiddleware resolveu (rotas /public/*)
    if (req.tenantId) {
      return `tenant:${req.tenantId}`;
    }

    // 3. Decodifica o payload do JWT (base64url) — SEM verificar assinatura
    const authHeader = req.headers?.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const payloadPart = token.split('.')[1];
        if (payloadPart) {
          const payload = JSON.parse(
            Buffer.from(payloadPart, 'base64url').toString('utf-8'),
          );
          if (payload.role === 'super_admin' && payload.sub) {
            return `user:${payload.sub}`;
          }
          if (payload.tenantId) {
            return `tenant:${payload.tenantId}`;
          }
        }
      } catch {
        // Token malformado — cai no fallback por IP
      }
    }

    // 4. Fallback: IP
    return `ip:${req.ip}`;
  }
}