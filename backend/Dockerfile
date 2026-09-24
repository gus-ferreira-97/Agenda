# ---- Estágio 1: Build ----
FROM node:22-alpine AS build

WORKDIR /app

# Copia apenas os arquivos de dependências primeiro (melhor cache)
COPY package.json package-lock.json ./

# Instala TODAS as dependências (incluindo dev) de forma reproduzível
RUN npm ci

# Copia o resto do código e compila
COPY . .
RUN npm run build

# Remove devDependencies da node_modules
RUN npm prune --omit=dev

# ---- Estágio 2: Runtime ----
FROM node:22-slim AS runtime

WORKDIR /app

# Define NODE_ENV como production
ENV NODE_ENV=production

# Copia APENAS o necessário do estágio de build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./

# Usa o usuário non-root que já vem na imagem oficial
USER node

# Expõe a porta da API
EXPOSE 3000

# Healthcheck para o Docker monitorar
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Executa a aplicação
CMD ["node", "dist/main.js"]