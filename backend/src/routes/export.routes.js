const {
  exportLeadsHandler,
  triggerScrapeHandler,
  getAutoSyncStatusHandler,
  toggleAutoSyncHandler,
  triggerAutoSyncNowHandler,
} = require("../controllers/export.controller");

const { verifyToken } = require("../middleware/authenticate");
const { requireRole } = require("../middleware/authorize");

module.exports = async function (fastify) {
  fastify.addHook("preHandler", verifyToken);

  // Streaming CSV / Excel Export endpoint
  fastify.get(
    "/export/leads",
    {
      preHandler: requireRole([
        "ADMIN",
        "MANAGER",
        "SALES_REP",
        "RECRUITER",
        "VIEWER",
      ]),
    },
    exportLeadsHandler
  );

  // Trigger Real-time targeted web scraping
  fastify.post(
    "/scraper/trigger",
    {
      preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP"]),
    },
    triggerScrapeHandler
  );

  // Auto-Sync Status
  fastify.get(
    "/scraper/auto-sync",
    {
      preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER", "VIEWER"]),
    },
    getAutoSyncStatusHandler
  );

  // Toggle Auto-Sync Schedule
  fastify.post(
    "/scraper/auto-sync/toggle",
    {
      preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP"]),
    },
    toggleAutoSyncHandler
  );

  // Trigger Immediate Auto-Sync Run
  fastify.post(
    "/scraper/auto-sync/run-now",
    {
      preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP"]),
    },
    triggerAutoSyncNowHandler
  );
};
