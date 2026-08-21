FROM n8nio/n8n:1.61.0

USER root

COPY n8n-workflows/ /home/node/.n8n/workflows-import/

RUN chown -R node:node /home/node/.n8n

USER node
EXPOSE 5678

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5678/healthz || exit 1