FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY scraper-engine/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY scraper-engine/src ./src

ENV PYTHONUNBUFFERED=1
ENV PORT=5050
ENV HOST=0.0.0.0

EXPOSE 5050

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://127.0.0.1:5050/health || exit 1

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "5050"]
