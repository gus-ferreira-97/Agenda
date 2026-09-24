import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { extractSubdomain } from '../helpers/extract-subdomain';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async use(req: any, res: any, next: () => void) {
    const host = req.headers.host;
    const subdomain = extractSubdomain(host);

    if (subdomain) {
      const tenant = await this.tenantRepository.findOne({
        where: { subdomain },
      });
      if (!tenant) {
        throw new BadRequestException(
          `Tenant não encontrado para o subdomínio: ${subdomain}`,
        );
      }
      req.tenantId = tenant.id;
      req.tenantSubdomain = subdomain;
    } else if (
      process.env.NODE_ENV !== 'production' &&
      host?.includes('localhost')
    ) {
      // Fallback apenas em desenvolvimento — nunca em produção
      const fallbackSubdomain =
        process.env.DEFAULT_TENANT_SUBDOMAIN || 'barbeariadoze';
      const tenant = await this.tenantRepository.findOne({
        where: { subdomain: fallbackSubdomain },
      });
      if (tenant) {
        req.tenantId = tenant.id;
        req.tenantSubdomain = fallbackSubdomain;
      }
    }

    next();
  }
}