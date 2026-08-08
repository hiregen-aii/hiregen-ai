# docker/nginx-proxy.Dockerfile
# Build from the REPO ROOT:
#   docker build -f docker/nginx-proxy.Dockerfile -t hiregen-nginx-proxy:latest .

FROM nginx:1.25-alpine

# Remove default configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom configurations from repository
COPY infra/nginx/nginx.conf /etc/nginx/nginx.conf
COPY infra/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

# Expose HTTP Edge Port
EXPOSE 80

# Built-in Container Healthcheck
HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/healthz || exit 1

# Start Nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]
