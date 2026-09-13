const {
  getAllDailyHandler,
  getDailyByDateHandler,
  getAllMonthlyHandler,
  getMonthlyByMonthHandler,
  getActivityFeedHandler,
  getTeamPerformanceHandler,
  getAiInsightsHandler,
} = require("../controllers/analytics.controller");

const { verifyToken } = require("../middleware/authenticate");
const { requireRole } = require("../middleware/authorize");

module.exports = async function (fastify) {
  fastify.addHook("preHandler", verifyToken);

  fastify.get("/daily", { preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER", "VIEWER"]) }, getAllDailyHandler);
  fastify.get(
    "/daily/:reportDate",
    { preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER", "VIEWER"]) },
    getDailyByDateHandler
  );
  fastify.get("/monthly", { preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER", "VIEWER"]) }, getAllMonthlyHandler);
  fastify.get(
    "/monthly/:reportMonth",
    { preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER", "VIEWER"]) },
    getMonthlyByMonthHandler
  );

  // Live Dashboard Widgets Endpoints
  fastify.get(
    "/activity",
    { preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER", "VIEWER"]) },
    getActivityFeedHandler
  );

  fastify.get(
    "/team",
    { preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER", "VIEWER"]) },
    getTeamPerformanceHandler
  );

  fastify.get(
    "/insights",
    { preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER", "VIEWER"]) },
    getAiInsightsHandler
  );
};