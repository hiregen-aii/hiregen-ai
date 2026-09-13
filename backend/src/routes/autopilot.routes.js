const {
  getAutopilotStatusHandler,
  setAutopilotConfigHandler,
  runAutopilotNowHandler,
} = require("../controllers/autopilot.controller");

const { verifyToken } = require("../middleware/authenticate");
const { requireRole } = require("../middleware/authorize");

module.exports = async function (fastify) {
  fastify.addHook("preHandler", verifyToken);

  // Status endpoint: view current mode & metrics
  fastify.get(
    "/status",
    {
      preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER", "VIEWER"]),
    },
    getAutopilotStatusHandler
  );

  // Toggle mode & configuration
  fastify.post(
    "/config",
    {
      preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP"]),
    },
    setAutopilotConfigHandler
  );

  // Trigger manual batch dispatch of qualified leads now
  fastify.post(
    "/run-now",
    {
      preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP"]),
    },
    runAutopilotNowHandler
  );
};
