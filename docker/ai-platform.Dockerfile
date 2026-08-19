# Team 3 AI Platform Service
# Build from repository root:
# docker build -f docker/ai-platform.Dockerfile -t hiregen-ai-platform:team4-test .

FROM node:20-slim AS build

WORKDIR /app

COPY ai-platform-service/backend/package*.json ./
RUN npm ci

COPY ai-platform-service/backend/ ./
RUN npm run build


FROM node:20-slim AS runner

ENV NODE_ENV=production
ENV PORT=3100
ENV HOST=0.0.0.0

WORKDIR /app

RUN groupadd -r nodegrp && useradd -r -g nodegrp nodeusr

COPY --from=build --chown=nodeusr:nodegrp /app/package*.json ./
COPY --from=build --chown=nodeusr:nodegrp /app/node_modules ./node_modules
COPY --from=build --chown=nodeusr:nodegrp /app/dist ./dist

USER nodeusr

EXPOSE 3100

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:'+(process.env.PORT||3100)+'/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "dist/src/server.js"]
