# Используем Node 20 с Alpine
FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем весь исходный код
COPY . .

# Билдим Next.js приложение
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
RUN npm run build

# Экспонируем порт приложения
EXPOSE 3000

# Запуск приложения
CMD ["npm", "start"]
