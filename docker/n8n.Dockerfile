# docker/n8n.Dockerfile
#
# n8n ships as a finished, already-optimized image, so there isn't a
# meaningful "build from source" stage to multi-stage here — the
# production-ready pattern for n8n is to extend the official image with
# your custom workflows on top, which is what this does.
#
# Build from REPO ROOT:
#   docker build -f docker/n8n.Dockerfile -t hiregen-n8n:latest .

FROM n8nio/n8n:1.61.0

USER root

# Workflow JSON exports, staged for import — NOT baked-in secrets.
# Import them explicitly via `n8n import:workflow` at container start
# or manually, rather than auto-loading.
COPY n8n-workflows/ /home/node/.n8n/workflows-import/

RUN chown -R node:node /home/node/.n8n

USER node
EXPOSE 5678

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5678/healthz || exit 1