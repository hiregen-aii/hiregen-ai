# Stage 1: build — install deps and produce a static production build

FROM node:20-alpine AS build
ARG APP_DIR=frontend
WORKDIR /app

COPY ${APP_DIR}/package*.json ./
RUN npm install

COPY ${APP_DIR}/ .

RUN npm run build

FROM nginx:1.27-alpine AS runner

COPY docker/nginx.frontend.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
