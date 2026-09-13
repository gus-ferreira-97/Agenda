import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TenantService } from '../tenant/tenant.service';

@Injectable()
export class TrialCronService {
  private readonly logger = new Logger(TrialCronService.name);

  constructor(private readonly tenantService: TenantService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleTrialExpiration() {
    this.logger.log('Verificando trials expirados...');

    try {
      const expiredTenants = await this.tenantService.findExpiredTrials();

      if (expiredTenants.length === 0) {
        this.logger.log('Nenhum trial expirado.');
        return;
      }

      const updated = await this.tenantService.expireTrials();

      this.logger.log(`${updated} tenant(s) tiveram o trial expirado:`);
      expiredTenants.forEach((t) => {
        this.logger.log(`  - ${t.name} (${t.subdomain}) - trial expirou em ${t.trial_ends_at?.toISOString()}`);
      });

      // TODO: enviar e-mail para cada tenant avisando que o trial expirou
    } catch (err) {
      this.logger.error('Erro ao expirar trials', err);
    }
  }
}