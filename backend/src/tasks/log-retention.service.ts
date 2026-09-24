import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AuditLog } from '../audit-log/entities/audit-log.entity';

@Injectable()
export class LogRetentionService {
  private readonly logger = new Logger(LogRetentionService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async handleLogRetention() {
    const retentionDays = parseInt(
      this.configService.get<string>('LOG_RETENTION_DAYS') || '365',
      10,
    );

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    this.logger.log(
      `Removendo logs de auditoria anteriores a ${cutoffDate.toISOString()} (retenção de ${retentionDays} dias)...`,
    );

    try {
      const result = await this.auditLogRepository.delete({
        timestamp: LessThan(cutoffDate),
      });

      const removed = result.affected || 0;

      if (removed === 0) {
        this.logger.log('Nenhum log antigo para remover.');
      } else {
        this.logger.log(`${removed} log(s) de auditoria removido(s).`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      this.logger.error(`Falha ao remover logs antigos: ${message}`);
    }
  }
}