# 1. Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Ускорение и исправление сетевых проблем
RUN npm config set dns-result-order ipv4first

# Копируем package.json
COPY package*.json ./

# Ставим ВСЕ зависимости (dev + prod)
RUN npm ci

# Копируем проект
COPY . .

# Сборка Next.js
RUN npm run build


# 2. Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Копируем нужные файлы
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# ❗ Копируем node_modules из builder-а
COPY --from=builder /app/node_modules ./node_modules

# ❗ Никакого npm install здесь быть не должно
# Сервер всё равно не даст скачать пакеты

EXPOSE 3000
CMD ["npm", "start"]
