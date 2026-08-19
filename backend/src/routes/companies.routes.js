const {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
} = require("../controllers/companies.controller");
const { getCompanyTimelineHandler } = require("../controllers/timeline.controller");

const { verifyToken } = require("../middleware/authenticate");
const { requireRole } = require("../middleware/authorize");

module.exports = async function (fastify) {
  fastify.addHook("preHandler", verifyToken);

  fastify.post("/", { preHandler: requireRole(["ADMIN", "MANAGER"]) }, createCompany);
  fastify.get(
    "/",
    { preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER", "VIEWER"]) },
    getAllCompanies
  );
  fastify.get(
    "/:id",
    { preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER", "VIEWER"]) },
    getCompanyById
  );
  fastify.patch("/:id", { preHandler: requireRole(["ADMIN", "MANAGER"]) }, updateCompany);

  // Team 2 (2.5 CRM Timeline) — cross-listed with Team 4
  fastify.get(
    "/:id/timeline",
    { preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER", "VIEWER"]) },
    getCompanyTimelineHandler
  );
};