# Стадия 1: Билд приложения
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем package.json и package-lock.json для установки зависимостей
COPY package*.json ./
RUN npm ci

# Копируем весь код и билдим
COPY . .
RUN npm run build

# Стадия 2: Продакшен-образ
FROM node:18-alpine

WORKDIR /app

# Копируем только необходимые файлы из билдера
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Запускаем Next.js в продакшен-режиме
CMD ["npm", "start"]