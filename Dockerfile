# 阶段 1: 构建前端项目
FROM node:22-alpine AS build

# 配置 Alpine 国内镜像源（加速 apk add，如果需要的话）
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 安装中文语言支持，确保 UTF-8 编码正确
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone

# 设置语言环境变量
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm（使用国内镜像加速 npm install）
RUN npm config set registry https://registry.npmmirror.com && \
    npm install -g pnpm

# 设置 pnpm 国内镜像
RUN pnpm config set registry https://registry.npmmirror.com

# 安装依赖
RUN pnpm install

# 复制项目文件（node_modules 被 .dockerignore 排除）
COPY . .

# 构建项目
RUN pnpm run build

# 阶段 2: 运行 Nginx 服务(包含前端静态文件和反向代理配置)
FROM nginx:latest

# 复制构建产物到 Nginx 静态目录
COPY --from=build /app/dist /usr/share/nginx/html

# 复制 SSL 证书(仅生产环境需要)
COPY fullchain.pem /etc/nginx/ssl/fullchain.pem
COPY certkey.pem /etc/nginx/ssl/certkey.pem

# 复制 Nginx 配置文件模板
COPY nginx-frontend.conf /etc/nginx/templates/default.conf.template
COPY nginx-local.conf /etc/nginx/templates/local.conf.template

# 创建启动脚本,根据环境变量选择配置文件
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'set -e' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# 检查 NGINX_ENV 环境变量' >> /docker-entrypoint.sh && \
    echo 'echo "Checking NGINX_ENV: $NGINX_ENV"' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo 'if [ "$NGINX_ENV" = "local" ]; then' >> /docker-entrypoint.sh && \
    echo '  echo "Using local environment configuration (HTTP only)"' >> /docker-entrypoint.sh && \
    echo '  cp /etc/nginx/templates/local.conf.template /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'else' >> /docker-entrypoint.sh && \
    echo '  echo "Using production environment configuration (HTTPS + SSL)"' >> /docker-entrypoint.sh && \
    echo '  cp /etc/nginx/templates/default.conf.template /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'fi' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# 显示当前使用的配置' >> /docker-entrypoint.sh && \
    echo 'echo "Current Nginx config:"' >> /docker-entrypoint.sh && \
    echo 'head -10 /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# 启动 Nginx' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# 暴露端口
EXPOSE 80
EXPOSE 443

# 使用自定义启动脚本
CMD ["/docker-entrypoint.sh"]