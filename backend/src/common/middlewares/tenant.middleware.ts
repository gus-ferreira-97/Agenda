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

    // Exemplo: "barbeariadoze.agendaapp.local:5173" -> ["barbeariadoze", "agendaapp", "local:5173"]
    const parts = host.split('.');
    let subdomain: string | null = null;

    // Se tiver pelo menos 3 partes, o primeiro é o subdomínio
    if (parts.length >= 3) {
      subdomain = parts[0].toLowerCase();
    } else if (host.includes('localhost')) {
      // Fallback para desenvolvimento local sem subdomínio
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