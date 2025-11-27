# 1. Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Настройка сети для обхода ошибок
RUN npm config set registry http://registry.npmjs.org/ \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm config set fetch-retries 5 \
    && npm cache clean --force

# Устанавливаем все зависимости с verbose для лога
RUN npm ci --verbose

# Копируем весь проект
COPY . .

# Сборка Next.js
RUN npm run build

# 2. Production stage (аналогично вашему Astro-примеру)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Копируем весь /app из builder (как в Astro)
COPY --from=builder /app /app

# Повторно устанавливаем зависимости (только prod, для совместимости с примером; используем --production для оптимизации)
RUN npm ci --production --verbose

EXPOSE 3000
CMD ["npm", "start"]