"""
Deep Scraper Orchestrator Service.
Coordinates concurrent execution of all live radars, enforces Pydantic v2 Zero-Null schemas,
calculates multi-factor Lead Fit Scores, and generates SHA-256 deduplication keys.
"""

import asyncio
import hashlib
import time
from typing import List, Optional, Set, Dict, Any
from pydantic import BaseModel, Field, field_validator
from src.radars.hn_radar import HackerNewsRadar
from src.radars.ats_radars import ATSRadar
from src.radars.linkedin_radar import LinkedInRadar

INVALID_COMPANIES = {"gmail", "yahoo", "outlook", "hotmail", "unknown", "hiring", "remote", "company", "test"}


class LeadItem(BaseModel):
    """Pydantic v2 model enforcing strict Zero-Null policy on all lead fields."""
    company_name: str = Field(..., min_length=2)
    domain: str = Field(..., min_length=3)
    role_title: str = Field(..., min_length=2)
    location: str = Field(default="Remote / Hybrid")
    hiring_type: str = Field(default="FULL_TIME")
    fit_score: float = Field(default=88.0, ge=0.0, le=100.0)
    contact_name: str = Field(..., min_length=2)
    contact_title: str = Field(default="Head of Talent Acquisition")
    contact_email: str = Field(..., min_length=5)
    is_verified: bool = Field(default=True)
    source_url: str = Field(..., min_length=8)
    source_platform: str = Field(default="Open Web Radar")
    dedupe_key: str = Field(..., min_length=16)
    description: str = Field(default="")
    posted_at: str = Field(default="")

    @field_validator("company_name")
    @classmethod
    def validate_company(cls, v: str) -> str:
        v_clean = v.strip()
        if v_clean.lower() in INVALID_COMPANIES:
            raise ValueError(f"Invalid placeholder company name: {v}")
        return v_clean

    @field_validator("contact_email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v_clean = v.strip().lower()
        if "@" not in v_clean or "." not in v_clean.split("@")[1]:
            raise ValueError("Invalid email format")
        return v_clean

    @field_validator("domain")
    @classmethod
    def validate_domain(cls, v: str) -> str:
        d = v.strip().lower().split("/")[0].split(":")[0]
        if "." not in d:
            raise ValueError("Invalid domain name")
        return d

    @field_validator("hiring_type")
    @classmethod
    def validate_hiring_type(cls, v: str) -> str:
        v_upper = v.upper().strip() if v else "FULL_TIME"
        if v_upper not in {"FULL_TIME", "CONTRACT", "BULK_HIRING", "INTERN", "CAMPUS_DRIVE"}:
            return "FULL_TIME"
        return v_upper


class ScrapeRequest(BaseModel):
    query: Optional[str] = Field(default="")
    location: Optional[str] = Field(default="")
    hiring_type: Optional[str] = Field(default="")
    max_leads: Optional[int] = Field(default=30, ge=1, le=100)


class ScrapeResponse(BaseModel):
    success: bool = True
    total_found: int
    leads: List[LeadItem]
    sources_scanned: List[str]


def compute_dedupe_key(domain: str, role: str, url: str) -> str:
    """Cryptographic SHA-256 fingerprint for absolute deduplication."""
    norm = f"{domain.strip().lower()}:{role.strip().lower()}:{url.strip().lower()}"
    return hashlib.sha256(norm.encode("utf-8")).hexdigest()


def calculate_fit_score(role: str, contact_name: str) -> float:
    """Calculate multi-factor candidate match score."""
    score = 85.0
    r_lower = role.lower()

    if any(k in r_lower for k in ["staff", "principal", "lead", "head", "vp"]):
        score += 6.0
    elif any(k in r_lower for k in ["senior", "architect", "founding"]):
        score += 4.0

    if any(k in r_lower for k in ["ai", "machine learning", "distributed", "infra", "rust", "fullstack"]):
        score += 3.0

    if "Talent Acquisition" not in contact_name:
        score += 2.0  # Direct hiring manager bonus

    return min(98.0, max(75.0, score))


class DeepScraperService:
    """Enterprise Deep Scraper Orchestration Service with live telemetry."""

    def __init__(self):
        self.hn_radar = HackerNewsRadar()
        self.ats_radar = ATSRadar()
        self.linkedin_radar = LinkedInRadar()
        self.metrics: Dict[str, Any] = {
            "total_requests": 0,
            "total_leads_admitted": 0,
            "duplicates_prevented": 0,
            "last_scrape_timestamp": None,
        }

    async def run(self, request: ScrapeRequest) -> ScrapeResponse:
        self.metrics["total_requests"] += 1
        sources_scanned = [
            "Hacker News Verified Radar",
            "Greenhouse Enterprise Radar",
            "LinkedIn Public Radar",
        ]

        # Execute radars concurrently
        results = await asyncio.gather(
            self.hn_radar.fetch_jobs(
                query=request.query or "",
                hiring_type=request.hiring_type or "",
                max_results=request.max_leads or 30,
            ),
            self.ats_radar.fetch_all(query=request.query or "", max_results=15),
            self.linkedin_radar.fetch_jobs(
                query=request.query or "",
                location=request.location or "",
                hiring_type=request.hiring_type or "",
                max_results=15,
            ),
            return_exceptions=True,
        )

        # Interleave leads fairly across all radar sources
        raw_leads: List[dict] = []
        valid_results = [r for r in results if isinstance(r, list) and len(r) > 0]
        max_len = max((len(r) for r in valid_results), default=0)
        for idx in range(max_len):
            for r in valid_results:
                if idx < len(r):
                    raw_leads.append(r[idx])

        seen_keys: Set[str] = set()
        company_counts: Dict[str, int] = {}
        validated_leads: List[LeadItem] = []

        for item in raw_leads:
            if len(validated_leads) >= (request.max_leads or 30):
                break

            domain = item.get("domain", "").strip().lower()
            role = item.get("role_title", "Software Engineer").strip()
            url = item.get("source_url", "").strip()

            if not domain or not role or not url:
                continue

            # Market diversity guarantee: Max 2 positions per company in a single scan
            if company_counts.get(domain, 0) >= 2:
                continue

            if request.hiring_type and request.hiring_type.upper() != "ALL" and item.get("hiring_type") != request.hiring_type:
                continue

            dedupe_key = compute_dedupe_key(domain, role, url)
            if dedupe_key in seen_keys:
                self.metrics["duplicates_prevented"] += 1
                continue

            seen_keys.add(dedupe_key)
            company_counts[domain] = company_counts.get(domain, 0) + 1
            item["dedupe_key"] = dedupe_key
            item["fit_score"] = calculate_fit_score(role, item.get("contact_name", ""))

            try:
                lead = LeadItem(**item)
                validated_leads.append(lead)
            except Exception:
                # Discard invalid or placeholder records
                continue

        self.metrics["total_leads_admitted"] += len(validated_leads)
        self.metrics["last_scrape_timestamp"] = time.time()

        return ScrapeResponse(
            success=True,
            total_found=len(validated_leads),
            leads=validated_leads,
            sources_scanned=sources_scanned,
        )

    def get_metrics(self) -> Dict[str, Any]:
        """Return operational telemetry."""
        return dict(self.metrics)

