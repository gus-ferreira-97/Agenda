# Usa a mesma imagem do Postgres (16) — já vem com pg_dump, gzip, sh, find
FROM postgres:16-alpine

# Define timezone (para o timestamp dos arquivos ficar correto)
ENV TZ=America/Sao_Paulo
RUN apk add --no-cache tzdata

WORKDIR /scripts

COPY backup.sh /scripts/backup.sh
RUN chmod +x /scripts/backup.sh

CMD ["/scripts/backup.sh"]