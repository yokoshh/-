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
RUN npm run build

# Экспонируем порт приложения
EXPOSE 3000

# Запуск приложения
CMD ["npm", "start"]
