import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly auditLogService: AuditLogService) {}

  // Mapeia segmentos de rota para nomes de entidade
  private readonly entityMap: Record<string, string> = {
    tenants: 'Tenant',
    users: 'User',
    professionals: 'Professional',
    services: 'Service',
    'service-options': 'ServiceOption',
    'work-schedules': 'WorkSchedule',
    'professional-services': 'ProfessionalService',
    appointments: 'Appointment',
  };

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.originalUrl || request.url;
    const user = request.user;

    // Só loga métodos de escrita
    const writeMethods = ['POST', 'PATCH', 'PUT', 'DELETE'];
    if (!writeMethods.includes(method)) {
      return next.handle();
    }

    // Ignora rotas de autenticação e públicas (não são ações administrativas)
    if (
      url.includes('/auth/') ||
      url.includes('/public/') ||
      url.includes('/super-admin/metrics') ||
      url.includes('/tenant-metrics')
    ) {
      return next.handle();
    }

    // Ignora se não houver usuário autenticado
    if (!user || !user.userId) {
      return next.handle();
    }

    // Extrai o segmento principal da rota (ex.: /appointments/1 → appointments)
    const pathSegments = url.split('?')[0].split('/').filter(Boolean);
    const mainSegment = pathSegments[0];
    const entity = this.entityMap[mainSegment] || mainSegment;

    // Determina a ação
    let action = 'unknown';
    if (method === 'POST') action = 'create';
    else if (method === 'PATCH' || method === 'PUT') action = 'update';
    else if (method === 'DELETE') action = 'delete';

    // Extrai o ID da entidade (do param da rota, se houver)
    const paramId = pathSegments[1] ? parseInt(pathSegments[1], 10) : null;

    return next.handle().pipe(
      tap({
        next: (response) => {
          // Em caso de sucesso, tenta extrair o ID da resposta (útil em creates)
          const responseId =
            response && typeof response === 'object' && 'id' in response
              ? response.id
              : null;

          const entityId = responseId ?? paramId;

          if (!entityId) {
            // Se não conseguimos identificar o ID, ainda loga (mas com id genérico 0)
            this.logger.debug(
              `Não foi possível identificar o ID para ${action} em ${entity}`,
            );
          }

          // Dispara em background — não bloqueia a resposta
          this.auditLogService
            .log({
              userId: user.userId,
              tenantId: user.tenantId ?? null,
              action,
              entity,
              entityId: entityId ?? 0,
            })
            .catch((err) => {
              // Defesa em profundidade — o service já captura erros internamente
              this.logger.error(`Erro inesperado no audit log: ${err.message}`);
            });
        },
        error: () => {
          // Não loga requisições que falharam (o log só é feito em sucesso)
          // Se quiser logar erros também, podemos evoluir depois
        },
      }),
    );
  }
}