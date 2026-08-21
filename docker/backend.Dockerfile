# Stage 1: deps — install once, cached separately from source changes

FROM node:20-alpine AS deps
WORKDIR /app

COPY backend/package*.json ./
RUN npm ci

# Stage 2: build — copy source, run build step if the project has one

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY backend/ .
RUN npm run build --if-present

# Stage 3: production runtime — small, non-root user

FROM node:20-alpine AS runner
ENV NODE_ENV=production \
    PORT=4000

WORKDIR /app

RUN addgroup -S nodegrp && adduser -S nodeusr -G nodegrp

COPY --from=build /app .

USER nodeusr
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:'+(process.env.PORT||4000)+'/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["npx", "tsx", "src/index.ts"]