# docker/backend.Dockerfile
#
# Build from the REPO ROOT so this Dockerfile can see apps/backend/:
#   docker build -f docker/backend.Dockerfile -t hiregen-backend:latest .
#
# ---------------------------------------------------------------------------
# Stage 1: deps — install once, cached separately from source changes
# ---------------------------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app

# Copy only manifest files first so this layer is cached unless
# package.json/package-lock.json actually change.
COPY backend/package*.json ./
RUN npm ci
RUN mkdir -p node_modules

# ---------------------------------------------------------------------------
# Stage 2: build — copy source, run build step if the project has one
# (safe no-op for plain JS backends with no compile step)
# ---------------------------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY backend/ .
RUN npm run build --if-present

# ---------------------------------------------------------------------------
# Stage 3: production runtime — small, no dev deps, non-root user
# ---------------------------------------------------------------------------
FROM node:20-alpine AS runner
ENV NODE_ENV=production \
    PORT=4000

WORKDIR /app

# Non-root user for defense-in-depth
RUN addgroup -S nodegrp && adduser -S nodeusr -G nodegrp

# Install only production dependencies in the final image
COPY backend/package*.json ./
RUN npm ci && npm cache clean --force

# Bring over built/compiled app code from the build stage
COPY --from=build /app .

USER nodeusr
EXPOSE 4000

# Uses the existing health.routes.js endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:'+(process.env.PORT||4000)+'/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["npx", "tsx", "src/index.ts"]