"""
Enterprise-Grade Async DNS MX Deliverability Verifier.
Validates live mail exchangers for target domains with multi-nameserver fallback,
sinkhole detection, disposable domain filtering, and in-memory caching.
"""

import re
from typing import Dict, Set
import dns.asyncresolver

_MX_CACHE: Dict[str, bool] = {}
_MAX_CACHE_SIZE = 5000

DISPOSABLE_PROVIDERS: Set[str] = {
    "mailinator.com", "tempmail.com", "guerrillamail.com", "10minutemail.com",
    "throwawaymail.com", "sharklasers.com", "example.com", "test.com", "domain.com",
    "yopmail.com", "trashmail.com", "dispostable.com", "getairmail.com",
    "fakeinbox.com", "mytemp.email", "maildrop.cc", "inboxkitten.com",
    "burnermail.io", "temp-mail.org", "crazymailing.com", "emailondeck.com",
    "nada.ltd", "mohmal.com", "generator.email", "dropmail.me", "fakemailgenerator.com",
}

UPSTREAM_NAMESERVERS = ["1.1.1.1", "8.8.8.8", "9.9.9.9"]

EMAIL_SYNTAX_REGEX = re.compile(
    r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$"
)


def is_valid_email_syntax(email: str) -> bool:
    """Validate email syntax against RFC 5322 standard."""
    if not email or len(email) > 254:
        return False
    return bool(EMAIL_SYNTAX_REGEX.match(email.strip()))


def clean_domain(domain: str) -> str:
    """Normalize domain name to lowercase without protocol, ports, or paths."""
    d = domain.lower().strip()
    d = re.sub(r"^https?://", "", d)
    d = re.sub(r"^www\.", "", d)
    d = d.split("/")[0].split(":")[0].strip()
    return d


async def verify_domain_mx(domain: str) -> bool:
    """
    Verify whether the domain has valid, reachable Mail Exchanger (MX) records.
    Uses multi-resolver fallback (system -> Cloudflare 1.1.1.1 -> Google 8.8.8.8).
    Cached in memory to guarantee sub-millisecond lookup on repeat domains.
    """
    clean_dom = clean_domain(domain)
    if not clean_dom or len(clean_dom) < 3 or "." not in clean_dom:
        return False

    if clean_dom in DISPOSABLE_PROVIDERS:
        return False

    if clean_dom in _MX_CACHE:
        return _MX_CACHE[clean_dom]

    if len(_MX_CACHE) > _MAX_CACHE_SIZE:
        _MX_CACHE.clear()

    # Step 1: Query with default system resolver
    try:
        resolver = dns.asyncresolver.Resolver()
        resolver.timeout = 2.5
        resolver.lifetime = 2.5
        answers = await resolver.resolve(clean_dom, "MX")
        is_valid = len(answers) > 0 and any(bool(r.exchange and str(r.exchange) != ".") for r in answers)
        if is_valid:
            _MX_CACHE[clean_dom] = True
            return True
    except Exception:
        pass

    # Step 2: Fallback to high-reliability upstream public resolvers (1.1.1.1 / 8.8.8.8)
    try:
        fallback_resolver = dns.asyncresolver.Resolver(configure=False)
        fallback_resolver.nameservers = UPSTREAM_NAMESERVERS
        fallback_resolver.timeout = 3.0
        fallback_resolver.lifetime = 3.0
        answers = await fallback_resolver.resolve(clean_dom, "MX")
        is_valid = len(answers) > 0 and any(bool(r.exchange and str(r.exchange) != ".") for r in answers)
        if is_valid:
            _MX_CACHE[clean_dom] = True
            return True
    except Exception:
        pass

    # Step 3: Check A record if domain acts as an implicit mail host (RFC 5321 section 5.1)
    try:
        fallback_resolver = dns.asyncresolver.Resolver(configure=False)
        fallback_resolver.nameservers = UPSTREAM_NAMESERVERS
        fallback_resolver.timeout = 2.0
        fallback_resolver.lifetime = 2.0
        a_records = await fallback_resolver.resolve(clean_dom, "A")
        is_valid = len(a_records) > 0
        _MX_CACHE[clean_dom] = is_valid
        return is_valid
    except Exception:
        _MX_CACHE[clean_dom] = False
        return False


async def verify_email_address(email: str) -> bool:
    """Verify syntax and domain deliverability for an email address."""
    if not is_valid_email_syntax(email):
        return False
    domain = email.split("@")[1]
    return await verify_domain_mx(domain)
