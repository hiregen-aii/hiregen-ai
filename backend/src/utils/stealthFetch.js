/**
 * Stealth Networking & Anti-Detection Engine
 * Provides rotating browser user-agents, client-hints mimicry, exponential jitter,
 * and adaptive per-domain circuit-breakers to eliminate IP bans and 429 rate-limiting.
 */

// Modern Desktop Browser User-Agent Pool
const USER_AGENTS = [
  {
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    platform: '"Windows"',
    chUa: '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  },
  {
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    platform: '"macOS"',
    chUa: '"Chromium";v="123", "Google Chrome";v="123", "Not-A.Brand";v="99"',
  },
  {
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
    platform: '"Windows"',
    chUa: null,
  },
  {
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    platform: '"macOS"',
    chUa: null,
  },
  {
    ua: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    platform: '"Linux"',
    chUa: '"Chromium";v="122", "Google Chrome";v="122", "Not-A.Brand";v="24"',
  },
  {
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0",
    platform: '"Windows"',
    chUa: '"Microsoft Edge";v="124", "Chromium";v="124", "Not-A.Brand";v="99"',
  },
];

let uaIndex = 0;
function getNextUserAgent() {
  const profile = USER_AGENTS[uaIndex % USER_AGENTS.length];
  uaIndex++;
  return profile;
}

// In-Memory Circuit Breakers per hostname (trip on 429 or 403, cooldown 10 mins)
const circuitBreakers = new Map();
const COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

function isCircuitOpen(hostname) {
  const tripTime = circuitBreakers.get(hostname);
  if (!tripTime) return false;
  if (Date.now() - tripTime > COOLDOWN_MS) {
    circuitBreakers.delete(hostname);
    return false;
  }
  return true;
}

function tripCircuit(hostname) {
  circuitBreakers.set(hostname, Date.now());
  console.warn(`[CIRCUIT BREAKER] Tripped for ${hostname} due to rate-limit / block. Cooling down for 10 minutes.`);
}

/**
 * Generates natural human-like browser headers.
 */
function buildStealthHeaders(customHeaders = {}) {
  const profile = getNextUserAgent();
  const headers = {
    "User-Agent": profile.ua,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "DNT": "1",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    ...customHeaders,
  };

  if (profile.chUa) {
    headers["sec-ch-ua"] = profile.chUa;
    headers["sec-ch-ua-mobile"] = "?0";
    headers["sec-ch-ua-platform"] = profile.platform;
  }

  return headers;
}

/**
 * Random jitter sleep helper to prevent robotic request cadence.
 */
function sleepWithJitter(minMs = 150, maxMs = 450) {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Robust fetch with automatic anti-detection headers, circuit breaker,
 * timeout containment, and safe error handling.
 */
async function stealthFetch(url, options = {}, timeoutMs = 8000) {
  let hostname = "unknown";
  try {
    hostname = new URL(url).hostname;
  } catch {
    // Malformed URL
    return null;
  }

  // Check circuit breaker to prevent hammering blocked hosts
  if (isCircuitOpen(hostname)) {
    return null;
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const headers = buildStealthHeaders(options.headers || {});
    const response = await fetch(url, {
      ...options,
      headers,
      signal: ctrl.signal,
    });
    clearTimeout(timer);

    // Rate-limiting detection
    if (response.status === 429 || response.status === 403) {
      tripCircuit(hostname);
      return null;
    }

    return response;
  } catch (err) {
    clearTimeout(timer);
    return null;
  }
}

module.exports = {
  stealthFetch,
  buildStealthHeaders,
  sleepWithJitter,
  isCircuitOpen,
  tripCircuit,
};
