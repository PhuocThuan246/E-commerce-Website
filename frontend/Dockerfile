# ---- Build stage ----
FROM node:20-alpine AS build

# Tạo thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài dependencies
RUN npm ci

# Copy toàn bộ source code
COPY . .

# Build production
RUN npm run build

# ---- Run stage (Nginx) ----
FROM nginx:stable-alpine

# Copy file build từ Vite (dist/)
COPY --from=build /app/dist /usr/share/nginx/html

# Mở port 80 cho web
EXPOSE 80

# Chạy Nginx ở foreground (bắt buộc cho Docker)
CMD ["nginx", "-g", "daemon off;"]
