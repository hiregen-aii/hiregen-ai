const {
  getCandidatesHandler,
  createCandidateHandler,
  updateCandidateHandler,
  deleteCandidateHandler,
  getCandidateStatsHandler,
  syncCandidatesHandler,
  exportCandidatesHandler,
} = require("../controllers/candidates.controller");

const { verifyToken } = require("../middleware/authenticate");
const { requireRole } = require("../middleware/authorize");

module.exports = async function (fastify) {
  fastify.addHook("preHandler", verifyToken);

  // List candidates
  fastify.get(
    "/",
    {
      preHandler: requireRole([
        "ADMIN",
        "MANAGER",
        "SALES_REP",
        "RECRUITER",
        "VIEWER",
      ]),
    },
    getCandidatesHandler
  );

  // Candidate pool statistics
  fastify.get(
    "/stats",
    {
      preHandler: requireRole([
        "ADMIN",
        "MANAGER",
        "SALES_REP",
        "RECRUITER",
        "VIEWER",
      ]),
    },
    getCandidateStatsHandler
  );

  // Dedicated candidate export (CSV & XLSX)
  fastify.get(
    "/export",
    {
      preHandler: requireRole([
        "ADMIN",
        "MANAGER",
        "SALES_REP",
        "RECRUITER",
        "VIEWER",
      ]),
    },
    exportCandidatesHandler
  );

  // Trigger live Indian candidate scraping / sync
  fastify.post(
    "/sync",
    {
      preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER"]),
    },
    syncCandidatesHandler
  );

  // Create candidate
  fastify.post(
    "/",
    {
      preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER"]),
    },
    createCandidateHandler
  );

  // Update candidate
  fastify.put(
    "/:id",
    {
      preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER"]),
    },
    updateCandidateHandler
  );

  // Delete candidate
  fastify.delete(
    "/:id",
    {
      preHandler: requireRole(["ADMIN", "MANAGER"]),
    },
    deleteCandidateHandler
  );
};
