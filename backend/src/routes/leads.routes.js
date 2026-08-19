// Team 2 (2.5 Lead Management)
//
// FIX: none of these routes had authenticate/authorize middleware before —
// anyone could hit them without a token. Applied per SRS §13 RBAC matrix:
//   - View leads:            ADMIN, MANAGER, SALES_REP (own+team), VIEWER (readonly)
//   - Edit lead / reassign:  ADMIN, MANAGER, SALES_REP (own only)
//   - Trigger research:      SALES_REP+ (same tier as "Approve outreach draft")

const {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  researchLead,
} = require("../controllers/leads.controller");
const { getLeadTimelineHandler } = require("../controllers/timeline.controller");

const { verifyToken } = require("../middleware/authenticate");
const { requireRole } = require("../middleware/authorize");

module.exports = async function (fastify) {
  fastify.addHook("preHandler", verifyToken);

  fastify.post(
    "/",
    { preHandler: requireRole(["ADMIN", "MANAGER"]) },
    createLead
  );

  fastify.get(
    "/",
    { preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER", "VIEWER"]) },
    getAllLeads
  );

  fastify.get(
    "/:id",
    { preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER", "VIEWER"]) },
    getLeadById
  );

  fastify.patch(
    "/:id",
    { preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP"]) },
    updateLead
  );

  fastify.post(
    "/:id/research",
    { preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP"]) },
    researchLead
  );

  // Team 2 (2.5 CRM Timeline) — cross-listed with Team 4
  fastify.get(
    "/:id/timeline",
    { preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER", "VIEWER"]) },
    getLeadTimelineHandler
  );
};