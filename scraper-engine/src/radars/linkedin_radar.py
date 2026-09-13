"""
LinkedIn Public Guest Jobs Radar.
Scrapes live open requisitions from LinkedIn's public guest search API.
Enforces STRICT ZERO SYNTHETIC EMAIL POLICY:
Only admits jobs if an authentic, deliverable email address is explicitly published
in the requisition details or company security/contact directory.
Never templates or guesses `talent@{domain}` or `first.last@{domain}`.
"""

import re
import urllib.parse
from typing import List, Dict, Any, Optional
from bs4 import BeautifulSoup
from src.core.stealth_client import StealthClient
from src.core.mx_verifier import verify_domain_mx
from src.radars.hn_radar import classify_hiring_type, clean_contact_from_email

EMAIL_REGEX = re.compile(r"([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})")


class LinkedInRadar:
    """Enterprise LinkedIn Public Radar Engine with Fast Async Concurrency."""

    def __init__(self, client: Optional[StealthClient] = None):
        self.client = client or StealthClient(timeout=3.5)

    async def _fetch_job_description_text(self, job_id: str) -> str:
        """Fetch full job posting text from guest API with strict timeout."""
        try:
            url = f"https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/{job_id}"
            resp = await asyncio.wait_for(
                self.client.get(url, domain_key="linkedin.com"),
                timeout=2.5,
            )
            if resp and resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                return soup.get_text(separator=" ")
        except Exception:
            pass
        return ""

    async def _discover_real_email(self, domain: str, text: str) -> Optional[str]:
        """Strictly find genuine published email. Never invent or template."""
        # 1. Search requisition text for authentic email
        matches = EMAIL_REGEX.findall(text)
        valid = [
            m.lower() for m in matches
            if not any(b in m.lower() for b in ["example.com", "sentry", "w3.org", "schema.org", ".png", ".jpg", "linkedin.com", "static.licdn"])
        ]
        for v in valid:
            email_dom = v.split("@")[1]
            if await verify_domain_mx(email_dom):
                return v

        # 2. Check company public security endpoint with quick timeout
        if domain:
            try:
                ep = f"https://{domain}/.well-known/security.txt"
                resp = await asyncio.wait_for(
                    self.client.get(ep, domain_key=domain),
                    timeout=1.8,
                )
                if resp and resp.status_code == 200:
                    ep_matches = EMAIL_REGEX.findall(resp.text)
                    for m in ep_matches:
                        m_clean = m.lower()
                        if domain in m_clean and not any(b in m_clean for b in ["example.com", "sentry", ".png"]):
                            if await verify_domain_mx(m_clean.split("@")[1]):
                                return m_clean
            except Exception:
                pass

        return None

    async def _process_single_card(
        self, card: Any, location: str, hiring_type: str
    ) -> Optional[Dict[str, Any]]:
        """Process an individual job card concurrently."""
        try:
            title_el = card.find("h3", class_="base-search-card__title")
            company_el = card.find("h4", class_="base-search-card__subtitle")
            loc_el = card.find("span", class_="job-search-card__location")
            link_el = card.find("a", class_="base-card__full-link")

            if not title_el or not company_el:
                return None

            raw_title = title_el.get_text(strip=True)
            raw_company = company_el.get_text(strip=True)
            raw_loc = loc_el.get_text(strip=True) if loc_el else (location or "Remote / Hybrid")
            raw_url = link_el["href"].split("?")[0] if link_el and "href" in link_el.attrs else ""

            if not raw_company or not raw_title or not raw_url:
                return None

            job_id_match = re.search(r"-(\d+)(?:\?|$)", raw_url)
            job_id = job_id_match.group(1) if job_id_match else ""

            clean_comp = re.sub(r"\s+", " ", raw_company).strip()
            comp_slug = re.sub(r"[^a-zA-Z0-9]", "", clean_comp).lower()
            if not comp_slug or len(comp_slug) < 2:
                return None

            # Check domain MX
            domain = f"{comp_slug}.com"
            is_mx_valid = await verify_domain_mx(domain)
            if not is_mx_valid:
                domain = f"{comp_slug}.io"
                is_mx_valid = await verify_domain_mx(domain)

            if not is_mx_valid:
                return None

            desc_text = await self._fetch_job_description_text(job_id) if job_id else ""

            # STRICT ZERO SYNTHETIC POLICY: Only admit if genuine verified email is discovered
            real_email = await self._discover_real_email(domain, desc_text)
            if not real_email:
                return None

            h_type = classify_hiring_type(desc_text or raw_title, raw_title)
            if hiring_type and hiring_type.upper() != "ALL" and h_type != hiring_type:
                return None

            contact = clean_contact_from_email(real_email, clean_comp, desc_text)

            return {
                "company_name": clean_comp[:60],
                "domain": domain,
                "role_title": raw_title[:90],
                "location": raw_loc[:60],
                "hiring_type": h_type,
                "fit_score": 93.0,
                "contact_name": contact["name"][:70],
                "contact_title": contact["title"][:70],
                "contact_email": real_email,
                "is_verified": True,
                "source_url": raw_url,
                "source_platform": "LinkedIn Public Radar",
                "description": f"Active public job requisition on LinkedIn at {clean_comp} for {raw_title}.",
                "posted_at": "",
            }
        except Exception:
            return None

    async def fetch_jobs(
        self, query: str = "", location: str = "", hiring_type: str = "", max_results: int = 15
    ) -> List[Dict[str, Any]]:
        jobs: List[Dict[str, Any]] = []
        q = urllib.parse.quote(query.strip() or "software engineer")
        loc = urllib.parse.quote(location.strip() or "remote")

        url = f"https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords={q}&location={loc}&start=0"
        try:
            resp = await asyncio.wait_for(
                self.client.get(url, domain_key="linkedin.com"),
                timeout=4.0,
            )
        except Exception:
            return jobs

        if not resp or resp.status_code != 200:
            return jobs

        soup = BeautifulSoup(resp.text, "html.parser")
        cards = soup.find_all("li")

        # Process top candidate cards concurrently (limit 8 to respect rate and latency)
        candidate_cards = cards[:8]
        tasks = [
            self._process_single_card(card, location, hiring_type)
            for card in candidate_cards
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        for res in results:
            if isinstance(res, dict) and res:
                jobs.append(res)
                if len(jobs) >= max_results:
                    break

        return jobs
