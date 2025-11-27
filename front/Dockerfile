# 1. Build stage
FROM node:20-slim AS builder
WORKDIR /app

COPY package*.json ./

RUN npm install -g pnpm
RUN pnpm install

COPY . .
RUN npm run build

# 2. Production stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app /app
# ❌ НЕ ставим пакеты заново, просто используем готовые
# COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
