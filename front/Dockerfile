# 1. Строим проект
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и package-lock.json / yarn.lock
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь проект
COPY . .

# Собираем Next.js
RUN npm run build

# 2. Production образ
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Копируем только необходимые файлы из билдера
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# Устанавливаем только production-зависимости
RUN npm install --production

# Порт приложения
EXPOSE 3000

# Запуск
CMD ["npm", "start"]
