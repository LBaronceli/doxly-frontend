# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
# your output is ./build
RUN test -d build && mv build /out

# --- Runtime stage ---
FROM nginx:1.27-alpine

# Our minimal nginx.conf (no 'user', single pid path)
RUN <<'EOF' tee /etc/nginx/nginx.conf
pid /tmp/nginx.pid;

events {
  worker_connections 1024;
}

http {
  include       /etc/nginx/mime.types;
  default_type  application/octet-stream;

  sendfile        on;
  keepalive_timeout  65;

  # Logs (directories chowned below)
  access_log  /var/log/nginx/access.log;
  error_log   /var/log/nginx/error.log warn;

  server_tokens off;

  include /etc/nginx/conf.d/*.conf;
}
EOF

# vhost: SPA + /healthz on 8080
RUN <<'EOF' tee /etc/nginx/conf.d/default.conf
server {
  listen 8080;
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  location = /healthz {
    access_log off;
    add_header Content-Type text/plain;
    return 200 "ok\n";
  }

  location ~* \.(?:js|css|woff2?)$ {
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri =404;
  }

  location / {
    add_header Cache-Control "no-cache";
    try_files $uri $uri/ /index.html;
  }

  gzip on;
  gzip_types text/plain text/css application/javascript application/json image/svg+xml;
}
EOF

# Static files
COPY --from=builder /out /usr/share/nginx/html

# Ensure writable dirs for non-root
RUN mkdir -p /var/cache/nginx /var/run/nginx /var/log/nginx \
 && chown -R 101:101 /var/cache/nginx /var/run/nginx /var/log/nginx /usr/share/nginx /etc/nginx

# Run nginx directly; no extra -g pid (we set it in nginx.conf)
USER 101:101
EXPOSE 8080
ENTRYPOINT ["nginx","-g","daemon off;"]
