#!/bin/sh
set -e

# ============================================================================
# Script de backup automático do Postgres
# - Roda pg_dump do banco a cada 24h
# - Comprime em .gz
# - Apaga backups com mais de RETENTION_DAYS dias
# ============================================================================

BACKUP_DIR="/backups"
RETENTION_DAYS=7

run_backup() {
  TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
  FILENAME="agenda_${TIMESTAMP}.sql.gz"
  FULL_PATH="${BACKUP_DIR}/${FILENAME}"

  echo "=========================================="
  echo "[$(date)] Iniciando backup: ${FILENAME}"
  echo "=========================================="

  # pg_dump com compressão direta via pipe
  # --no-owner / --no-acl: remove dependências de roles específicas
  # --clean: inclui DROP antes de CREATE (facilita restore)
  if PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump \
      -h db \
      -U "${POSTGRES_USER}" \
      -d "${POSTGRES_DB}" \
      --no-owner \
      --no-acl \
      --clean \
      --if-exists \
      | gzip > "${FULL_PATH}"; then

    SIZE=$(ls -lh "${FULL_PATH}" | awk '{print $5}')
    echo "[$(date)] ✅ Backup concluído: ${FILENAME} (${SIZE})"
  else
    echo "[$(date)] ❌ ERRO ao gerar backup" >&2
    rm -f "${FULL_PATH}"
    return 1
  fi

  # Aplica retenção (apaga backups mais antigos que RETENTION_DAYS)
  echo "[$(date)] Aplicando retenção de ${RETENTION_DAYS} dias..."
  DELETED=$(find "${BACKUP_DIR}" -name "agenda_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -print -delete | wc -l)
  if [ "${DELETED}" -gt 0 ]; then
    echo "[$(date)] 🗑️  ${DELETED} backup(s) antigo(s) removido(s)"
  fi

  # Lista backups atuais
  echo "[$(date)] Backups atuais:"
  ls -lh "${BACKUP_DIR}"/agenda_*.sql.gz 2>/dev/null || echo "  (nenhum)"
  echo ""
}

# ============================================================================
# Loop infinito: roda backup + espera 24h
# ============================================================================
echo "[$(date)] Serviço de backup iniciado"
echo "[$(date)] Retenção: ${RETENTION_DAYS} dias"
echo "[$(date)] Diretório: ${BACKUP_DIR}"
echo ""

while true; do
  run_backup || true   # continua mesmo se falhar
  echo "[$(date)] 💤 Próximo backup em 24h..."
  echo ""
  sleep 86400
done