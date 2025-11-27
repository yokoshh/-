# syntax=docker/dockerfile:1.4
# 1. Build stage
FROM node:20-slim AS builder
WORKDIR /app

# Установка pnpm с кэшированием
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm

# Копируем только package файлы для лучшего кэширования
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Устанавливаем зависимости с кэшированием и повторами
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile --network-timeout 60000 || \
    pnpm install --frozen-lockfile --network-timeout 60000 || \
    pnpm install --frozen-lockfile --network-timeout 60000

# Копируем исходный код и собираем
COPY . .
RUN npm run build

# 2. Production stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Копируем только нужные файлы из стадии сборки
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# Если есть другие нужные файлы (next.config.js, etc.)
COPY --from=builder /app/next.config.js* ./
COPY --from=builder /app/tsconfig.json ./

EXPOSE 3000
CMD ["npm", "start"]