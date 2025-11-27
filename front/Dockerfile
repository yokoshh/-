# syntax=docker/dockerfile:1.4
# 1. Build stage
FROM node:20-slim AS builder
WORKDIR /app

# Устанавливаем pnpm с кэшированием
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm

# Копируем только package файлы и config-файлы
COPY package*.json ./
COPY pnpm-lock.yaml* ./
COPY next.config.js* tsconfig.json ./

# Устанавливаем переменные окружения для pnpm
ENV PNPM_NETWORK_TIMEOUT=600000
ENV NODE_OPTIONS=--max_old_space_size=4096  # Фикс OOM

# Зеркало для ускорения (опционально)
RUN pnpm config set registry https://registry.npmmirror.com/

# Устанавливаем зависимости с кэшированием
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile --prefer-offline --ignore-scripts || \
    pnpm install --frozen-lockfile --prefer-offline --ignore-scripts || \
    pnpm install --prefer-offline --ignore-scripts

# Копируем исходный код и собираем
COPY . .
# Важно: для standalone нужно установить output: 'standalone' в next.config.js
RUN npm run build

# 2. Production stage (Минимальный образ для запуска)
# Next.js standalone не требует node_modules
FROM node:20-alpine AS runner
WORKDIR /app

# Устанавливаем ENV NODE_ENV=production
ENV NODE_ENV=production
# Устанавливаем PORT
ENV PORT=3000

# Копируем:
# 1. Standalone-сборку (включает server.js, необходимые node_modules и .next/static)
COPY --from=builder /app/.next/standalone ./
# 2. Public-файлы
COPY --from=builder /app/public ./public
# 3. next.config.js (если нужен, но часто уже внутри standalone)
COPY --from=builder /app/next.config.js ./next.config.js
# 4. package.json (если нужен для скриптов или информации)
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
# CMD для Next.js standalone
CMD ["node", "server.js"]