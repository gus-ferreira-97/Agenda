import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

export interface CreateAuditLogInput {
  userId: number | null;
  tenantId: number | null;
  action: string;
  entity: string;
  entityId: number;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Salva um log em background.
   * Nunca lança exceção — falhas são apenas logadas no console.
   * Isso garante que o fluxo principal da aplicação não seja afetado.
   */
  async log(input: CreateAuditLogInput): Promise<void> {
    try {
      const log = this.auditLogRepository.create({
        user_id: input.userId,
        tenant_id: input.tenantId,
        action: input.action,
        entity: input.entity,
        entity_id: input.entityId,
        ip_address: input.ipAddress ?? null,
        user_agent: input.userAgent ?? null,
      });
      await this.auditLogRepository.save(log);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      this.logger.error(
        `Falha ao salvar log de auditoria (${input.entity} #${input.entityId}): ${message}`,
      );
    }
  }
}