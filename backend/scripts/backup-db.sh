#!/bin/bash

# Configurações
CONTAINER_NAME="agenda_db"
DB_USER="agenda"
DB_NAME="agenda"
BACKUP_DIR="./backups"
RETENTION_DAYS=7

# Cria o diretório de backups se não existir
mkdir -p "$BACKUP_DIR"

# Gera o nome do arquivo com data/hora
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
FILENAME="$BACKUP_DIR/agenda_$TIMESTAMP.sql.gz"

echo "Iniciando backup do banco $DB_NAME..."

# Executa o pg_dump dentro do container e comprime na saída
docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$FILENAME"

# Verifica se o backup foi criado
if [ -f "$FILENAME" ] && [ -s "$FILENAME" ]; then
  SIZE=$(du -h "$FILENAME" | cut -f1)
  echo "✓ Backup criado: $FILENAME ($SIZE)"
else
  echo "✗ Falha ao criar o backup"
  exit 1
fi

# Remove backups mais antigos que o período de retenção
echo "Removendo backups com mais de $RETENTION_DAYS dias..."
find "$BACKUP_DIR" -name "agenda_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

# Lista os backups restantes
echo "Backups disponíveis:"
ls -lh "$BACKUP_DIR"/agenda_*.sql.gz 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'

echo "Backup concluído."