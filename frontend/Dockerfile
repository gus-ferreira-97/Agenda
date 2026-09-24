# ---- Estágio 1: Build ----
FROM node:22-slim AS build

WORKDIR /app

ARG VITE_SENTRY_DSN
ARG VITE_PUBLIC_DOMAIN
ARG VITE_TURNSTILE_SITE_KEY 
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN
ENV VITE_PUBLIC_DOMAIN=$VITE_PUBLIC_DOMAIN
ENV VITE_TURNSTILE_SITE_KEY=$VITE_TURNSTILE_SITE_KEY

COPY package.json package-lock.json ./
# Instala as dependências do projeto
RUN npm ci --include=optional

# FORÇA a instalação do binário nativo do rolldown para Linux (glibc x64),
# resolvendo o bug de dependências opcionais do npm em ambientes Docker.
RUN npm install --no-save @rolldown/binding-linux-x64-gnu@latest

COPY . .
RUN npm run build

# ---- Estágio 2: Runtime (Nginx) ----
FROM nginx:1.27-alpine AS runtime

# Remove a config padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia nossa config customizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos gerados pelo Vite
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]