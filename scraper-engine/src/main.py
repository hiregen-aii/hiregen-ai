"""
FastAPI Microservice Entrypoint for HireGen AI Python Deep Scraper.
Exposes /health, /api/v1/metrics, and /api/v1/scrape/deep endpoints.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from src.services.deep_scraper import DeepScraperService, ScrapeRequest, ScrapeResponse
from src.core.stealth_client import StealthClient

app = FastAPI(
    title="HireGen AI - Python Deep Scraper Engine",
    version="1.1.0",
    description="Enterprise anti-bot public job scraper and recruitment intelligence service",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scraper_service = DeepScraperService()


@app.get("/health")
async def health():
    """Service health check endpoint."""
    return {
        "status": "healthy",
        "service": "hiregen-scraper-engine",
        "version": "1.1.0",
    }


@app.get("/api/v1/metrics")
async def get_metrics():
    """Service telemetry and circuit breaker status."""
    return {
        "service": "hiregen-scraper-engine",
        "metrics": scraper_service.get_metrics(),
        "circuits": StealthClient.get_circuit_status(),
    }


@app.post("/api/v1/scrape/deep", response_model=ScrapeResponse)
async def scrape_deep(request: ScrapeRequest):
    """
    Trigger deep live scraping across multi-platform radars.
    Guarantees Zero-Null fields, SHA-256 deduplication, and DNS MX deliverability.
    """
    try:
        response = await scraper_service.run(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scraper engine failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=5050, reload=False)

