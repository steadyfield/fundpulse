# 多阶段构建 Dockerfile
# 阶段1: 构建阶段
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production=false

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 阶段2: 生产阶段 - 使用 Nginx 提供静态文件服务
FROM nginx:alpine

# 复制构建产物到 Nginx 目录（支持子路径部署）
# 由于 vite.config.ts 中 base 设置为 '/fundpulse/'，需要将文件放在子目录中
RUN mkdir -p /usr/share/nginx/html/fundpulse
COPY --from=builder /app/dist /usr/share/nginx/html/fundpulse

# 复制自定义 Nginx 配置（SPA 路由支持、Gzip 压缩、缓存策略等）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
