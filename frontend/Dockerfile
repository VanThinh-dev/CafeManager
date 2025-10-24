# =========================
# Stage 1: Build React app
# =========================
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files và cài dependency
COPY package*.json ./
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# Truyền biến môi trường API_URL vào lúc build (qua docker-compose)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build production
RUN npm run build

# =========================
# Stage 2: Serve với Nginx
# =========================
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Copy file cấu hình Nginx tùy chỉnh (để reverse proxy API)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
