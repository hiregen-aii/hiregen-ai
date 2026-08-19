# Monitoring Configuration

This directory contains the Prometheus monitoring configuration for the HireGen AI project.

## Files

- prometheus.yml
- alert.rules.yml
- recording.rules.yml

## Monitored Services

- Backend
- Redis
- PostgreSQL
- n8n
- Grafana
- Prometheus

Note: Redis and PostgreSQL are scraped via exporters (redis_exporter, postgres_exporter), not scraped directly, since neither service exposes Prometheus metrics natively. These exporter targets are currently placeholders until they're deployed. Backend and n8n scrape targets are also placeholders until those services expose a `/metrics` endpoint.

## Start Prometheus

```bash
docker compose up -d
```

## Access

Prometheus:
http://localhost:9090

Grafana:
http://localhost:3000

## Alerts

- Service Down — any monitored service is unreachable
- High Latency — average response time over 5m exceeds threshold
- Prometheus Down
- Redis Down
- PostgreSQL Down
- Repeated Failures — a service has gone down more than 3 times in 15 minutes (flapping)

## Recording Rules

- Instance up count / up ratio
- Request rate (per job)
- Average request duration (per job)

## Future Improvements

- Add Node Exporter
- Add cAdvisor
- Add Alertmanager
- Add Loki integration
- Add custom backend metrics