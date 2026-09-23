# Política de Retenção de Logs

**Versão:** 1.0
**Última atualização:** 20/09/2026

## Retenção no Banco de Dados (audit_logs)

- **Prazo:** 365 dias (12 meses), configurável via variável `LOG_RETENTION_DAYS`
- **Remoção:** automática, diariamente às 4h da manhã
- **Base legal:** art. 15 e 16 da LGPD + art. 15 do Marco Civil da Internet
- **Dados armazenados:** ID do usuário, ID do tenant, ação, entidade, timestamp
- **Dados NÃO armazenados:** conteúdo das requisições, senhas, tokens

## Retenção de Logs de Aplicação (Pino)

- **Formato:** JSON estruturado
- **Destino em produção:** arquivos no servidor (com rotação diária)
- **Retenção recomendada:** 30 dias em disco
- **Rotação:** gerenciada pelo servidor (logrotate ou similar)
- **Configuração:** será definida no momento do deploy

## Anonimização

- Logs de auditoria de usuários excluídos permanecem por referência
  ao `user_id`, mas o usuário em si é anonimizado (não há mais dados
  pessoais associados a esse ID).
- Após o prazo de retenção, os logs são **removidos permanentemente**.