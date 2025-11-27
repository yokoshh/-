# 1. Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем все зависимости
RUN npm ci

# Копируем весь проект
COPY . .

# Сборка Next.js
RUN npm run build

# 2. Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Копируем нужные файлы из builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# Копируем готовые node_modules
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
