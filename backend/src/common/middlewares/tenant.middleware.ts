import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../tenant/entities/tenant.entity';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) { }

  async use(req: any, res: any, next: () => void) {
    const host = req.headers.host;
    if (!host) {
      return next();
    }

    // Exemplo: "barbeariadoze.Agendy.local:5173" -> ["barbeariadoze", "Agendy", "local:5173"]
    const parts = host.split('.');
    let subdomain: string | null = null;

    // Caso 1: host padrão de produção (ex.: barbeariadoze.agendyapp.com.br)
    if (parts.length >= 3) {
      subdomain = parts[0].toLowerCase();
    }
    // Caso 2: dev — X.localhost ou X.local (2 partes)
    else if (
      parts.length === 2 &&
      ['localhost', 'local', 'localdomain'].includes(parts[1].toLowerCase())
    ) {
      subdomain = parts[0].toLowerCase();
    }
    // Caso 3: dev — sem subdomínio (fallback para tenant padrão)
    else if (
      process.env.NODE_ENV !== 'production' &&
      host.includes('localhost')
    ) {
      subdomain = process.env.DEFAULT_TENANT_SUBDOMAIN || 'barbeariadoze';
    }

    if (subdomain) {
      const tenant = await this.tenantRepository.findOne({
        where: { subdomain },
      });
      if (!tenant) {
        throw new BadRequestException(`Tenant não encontrado para o subdomínio: ${subdomain}`);
      }
      req.tenantId = tenant.id;
      req.tenantSubdomain = subdomain;
    }

    next();
  }
}