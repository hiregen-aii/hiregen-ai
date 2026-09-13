const dns = require("node:dns");

// Configure public high-reliability DNS resolvers as primary lookup
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Fallback to local default resolver
}

/**
 * Verifies if a company domain has active Mail Exchange (MX) DNS records.
 * Real companies with working email inboxes (e.g. Google Workspace, Microsoft 365)
 * always have 1 or more MX records.
 *
 * @param {string} domain - e.g. "apaleo.com", "vercel.com"
 * @returns {Promise<{ isDeliverable: boolean, mxRecords: Array<any>, error?: string }>}
 */
async function verifyDomainEmailDeliverability(domain) {
  if (!domain || typeof domain !== "string") {
    return { isDeliverable: false, mxRecords: [], error: "Invalid domain string" };
  }

  const cleanDomain = domain
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split(":")[0];

  try {
    const mxRecords = await dns.promises.resolveMx(cleanDomain);
    const valid = Array.isArray(mxRecords) && mxRecords.length > 0;
    return {
      isDeliverable: valid,
      mxRecords: valid ? mxRecords.sort((a, b) => a.priority - b.priority) : [],
    };
  } catch (err) {
    return {
      isDeliverable: false,
      mxRecords: [],
      error: err.code || err.message,
    };
  }
}

/**
 * Fast DNS A-record / web host check to verify company website exists.
 *
 * @param {string} domain
 * @returns {Promise<boolean>}
 */
async function verifyDomainHostExists(domain) {
  if (!domain || typeof domain !== "string") return false;
  const cleanDomain = domain
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split(":")[0];

  try {
    const addresses = await dns.promises.resolve4(cleanDomain);
    return Array.isArray(addresses) && addresses.length > 0;
  } catch {
    return false;
  }
}

module.exports = {
  verifyDomainEmailDeliverability,
  verifyDomainHostExists,
};
