# docker/frontend.Dockerfile
#
# Builds ONE of the two frontend apps (frontend-dashboard or frontend-console)
# using a build arg, since both share the same shape. Build from REPO ROOT:
#
#   docker build -f docker/frontend.Dockerfile \
#     --build-arg APP_DIR=apps/frontend-dashboard \
#     -t hiregen-frontend-dashboard:latest .
#
#   docker build -f docker/frontend.Dockerfile \
#     --build-arg APP_DIR=apps/frontend-console \
#     -t hiregen-frontend-console:latest .
#
# ---------------------------------------------------------------------------
# Stage 1: build — install deps and produce a static production build
# ---------------------------------------------------------------------------
FROM node:20-alpine AS build
ARG APP_DIR=frontend
WORKDIR /app

COPY ${APP_DIR}/package*.json ./
RUN npm install

COPY ${APP_DIR}/ .
# Works for Vite (`dist`) or CRA-style (`build`) — adjust the script name
# in package.json if your project uses something else.
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2: serve — static files only, via nginx, non-root
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runner

# SPA-friendly nginx config (falls back unknown routes to index.html)
COPY docker/nginx.frontend.conf /etc/nginx/conf.d/default.conf

# Copy whichever output directory the build produced.
# If your build outputs to "build" instead of "dist", swap the line below.
COPY --from=build /app/dist /usr/share/nginx/html

# nginx:alpine already runs the worker process as the unprivileged
# "nginx" user by default — no extra USER directive needed.

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
