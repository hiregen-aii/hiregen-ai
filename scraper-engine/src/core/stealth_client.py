"""
Anti-Bot Stealth HTTP Client.
Implements TLS Fingerprint emulation, realistic desktop headers,
randomized jitter, exponential backoff, proxy-readiness, and domain circuit breakers.
"""

import asyncio
import os
import random
import time
from typing import Dict, Optional, Any, List
import httpx

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0",
]

# Track domain cooldowns and error counts
_DOMAIN_COOLDOWNS: Dict[str, float] = {}
_DOMAIN_FAILURES: Dict[str, int] = {}
_DOMAIN_SEMAPHORES: Dict[str, asyncio.Semaphore] = {}


def get_proxy_list() -> List[str]:
    """Parse configured proxy pool from environment."""
    pool_str = os.getenv("PROXY_POOL", "").strip()
    if pool_str:
        return [p.strip() for p in pool_str.split(",") if p.strip()]
    single_proxy = os.getenv("ROTATING_PROXY_URL", "").strip()
    if single_proxy:
        return [single_proxy]
    return []


def get_random_headers(referer: Optional[str] = None) -> Dict[str, str]:
    """Generate authentic desktop browser headers to pass WAF scrutiny."""
    ua = random.choice(USER_AGENTS)
    headers = {
        "User-Agent": ua,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "max-age=0",
        "Sec-Ch-Ua": '"Chromium";v="125", "Google Chrome";v="125", "Not-A.Brand";v="99"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
    }
    if referer:
        headers["Referer"] = referer
        headers["Sec-Fetch-Site"] = "cross-site"
    return headers


async def sleep_with_jitter(min_ms: int = 150, max_ms: int = 450) -> None:
    """Randomized jitter to avoid synchronized scraping spikes."""
    delay = random.uniform(min_ms / 1000.0, max_ms / 1000.0)
    await asyncio.sleep(delay)


try:
    import h2  # noqa: F401
    HAS_H2 = True
except ImportError:
    HAS_H2 = False


class StealthClient:
    """Enterprise Async Stealth Client with retry logic and domain circuit breaker."""

    def __init__(self, timeout: float = 8.0, max_retries: int = 2):
        self.timeout = timeout
        self.max_retries = max_retries
        self.proxies = get_proxy_list()

    def _is_domain_cooling_down(self, domain: str) -> bool:
        expiry = _DOMAIN_COOLDOWNS.get(domain, 0)
        return time.time() < expiry

    def _trip_domain_circuit_breaker(self, domain: str):
        fails = _DOMAIN_FAILURES.get(domain, 0) + 1
        _DOMAIN_FAILURES[domain] = fails
        # Exponential backoff: 30s -> 120s -> 600s
        cooldown = min(600.0, 30.0 * (2 ** min(fails - 1, 4)))
        _DOMAIN_COOLDOWNS[domain] = time.time() + cooldown

    def _reset_domain_failures(self, domain: str):
        if domain in _DOMAIN_FAILURES:
            _DOMAIN_FAILURES[domain] = 0

    def _get_domain_semaphore(self, domain: str) -> asyncio.Semaphore:
        if domain not in _DOMAIN_SEMAPHORES:
            _DOMAIN_SEMAPHORES[domain] = asyncio.Semaphore(2)  # Max 2 concurrent calls per domain
        return _DOMAIN_SEMAPHORES[domain]

    async def get(
        self,
        url: str,
        headers: Optional[Dict[str, str]] = None,
        params: Optional[Dict[str, Any]] = None,
        domain_key: Optional[str] = None,
    ) -> Optional[httpx.Response]:
        """Perform stealth GET with circuit breaker, per-domain rate limiting, and backoff."""
        if domain_key and self._is_domain_cooling_down(domain_key):
            return None

        semaphore = self._get_domain_semaphore(domain_key or "default")

        async with semaphore:
            req_headers = get_random_headers()
            if headers:
                req_headers.update(headers)

            proxy_url = random.choice(self.proxies) if self.proxies else None

            for attempt in range(self.max_retries + 1):
                try:
                    await sleep_with_jitter(100, 300)
                    async with httpx.AsyncClient(
                        http2=HAS_H2,
                        proxy=proxy_url,
                        follow_redirects=True,
                        timeout=self.timeout,
                        verify=True,
                    ) as client:
                        resp = await client.get(url, headers=req_headers, params=params)

                        if resp.status_code in (429, 403, 503):
                            if domain_key:
                                self._trip_domain_circuit_breaker(domain_key)
                            if attempt < self.max_retries:
                                await asyncio.sleep(1.5 * (attempt + 1))
                                continue
                            return None

                        if resp.is_success:
                            if domain_key:
                                self._reset_domain_failures(domain_key)
                            return resp
                        return None

                except Exception:
                    if attempt < self.max_retries:
                        await asyncio.sleep(1.0 * (attempt + 1))
                        continue
                    return None
            return None

    async def get_json(
        self,
        url: str,
        headers: Optional[Dict[str, str]] = None,
        params: Optional[Dict[str, Any]] = None,
        domain_key: Optional[str] = None,
    ) -> Optional[Any]:
        """Fetch and parse JSON payload safely."""
        h = {"Accept": "application/json"}
        if headers:
            h.update(headers)
        resp = await self.get(url, headers=h, params=params, domain_key=domain_key)
        if resp:
            try:
                return resp.json()
            except Exception:
                return None
        return None

    @classmethod
    def get_circuit_status(cls) -> Dict[str, Any]:
        """Return live health of all tracked domains."""
        now = time.time()
        active_cooldowns = {
            dom: round(exp - now, 1)
            for dom, exp in _DOMAIN_COOLDOWNS.items()
            if exp > now
        }
        return {
            "cooling_domains_count": len(active_cooldowns),
            "cooling_domains": active_cooldowns,
            "domain_failure_counts": _DOMAIN_FAILURES,
        }
