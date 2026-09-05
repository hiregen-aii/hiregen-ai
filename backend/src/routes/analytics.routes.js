const {
  getAllDailyHandler,
  getDailyByDateHandler,
  getAllMonthlyHandler,
  getMonthlyByMonthHandler,
} = require("../controllers/analytics.controller");

const { verifyToken } = require("../middleware/authenticate");
const { requireRole } = require("../middleware/authorize");

module.exports = async function (fastify) {
  fastify.addHook("preHandler", verifyToken);

  fastify.get("/daily", { preHandler: requireRole(["ADMIN", "MANAGER"]) }, getAllDailyHandler);
  fastify.get(
    "/daily/:reportDate",
    { preHandler: requireRole(["ADMIN", "MANAGER"]) },
    getDailyByDateHandler
  );
  fastify.get("/monthly", { preHandler: requireRole(["ADMIN", "MANAGER"]) }, getAllMonthlyHandler);
  fastify.get(
    "/monthly/:reportMonth",
    { preHandler: requireRole(["ADMIN", "MANAGER"]) },
    getMonthlyByMonthHandler
  );
};