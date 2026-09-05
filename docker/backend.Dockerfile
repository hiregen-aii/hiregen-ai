# docker/backend.Dockerfile
#
# Build from the REPO ROOT so this Dockerfile can see backend/:
#   docker build -f docker/backend.Dockerfile -t hiregen-backend:latest .
#

# ---------------------------------------------------------------------------
# Stage 1: deps — install production dependencies
# ---------------------------------------------------------------------------
FROM node:20-slim AS deps
WORKDIR /app

# Copy only manifest files first to leverage build cache
COPY backend/package*.json ./
RUN npm ci --omit=dev

# ---------------------------------------------------------------------------
# Stage 2: production runtime — small, no dev dependencies, non-root user
# ---------------------------------------------------------------------------
FROM node:20-slim AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

WORKDIR /app

# Non-root user for defense-in-depth (Debian-compatible syntax)
RUN groupadd -r nodegrp && useradd -r -g nodegrp nodeusr

# Copy application source first
COPY --chown=nodeusr:nodegrp backend/ .

# Copy Linux-built dependencies over any potential host node_modules
COPY --from=deps --chown=nodeusr:nodegrp /app/node_modules ./node_modules

USER nodeusr
EXPOSE 3000

# Uses the existing health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:'+(process.env.PORT||3000)+'/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "src/server.js"]