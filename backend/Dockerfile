# ---- Backend Dockerfile ----
FROM node:20-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Copy file cấu hình trước (để cache layer cài npm)
COPY package*.json ./

# Cài dependencies (chỉ phần production)
RUN npm install --omit=dev

# Copy toàn bộ mã nguồn backend
COPY . .

# Expose cổng backend (cho các API service)
EXPOSE 5000

# Lệnh mặc định — chỉ dùng khi container này chạy kiểu API
CMD ["npm", "start"]




