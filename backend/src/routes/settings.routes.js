const {
  getAiSettingsHandler,
  updateAiSettingsHandler,
  testAiConnectionHandler,
} = require("../controllers/settings.controller");

const { verifyToken } = require("../middleware/authenticate");
const { requireRole } = require("../middleware/authorize");

module.exports = async function (fastify) {
  fastify.addHook("preHandler", verifyToken);

  // Get active AI provider, model, and metadata
  fastify.get(
    "/ai",
    {
      preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER", "VIEWER"]),
    },
    getAiSettingsHandler
  );

  // Update AI configuration (Admin/Manager/Sales)
  fastify.put(
    "/ai",
    {
      preHandler: requireRole(["ADMIN", "MANAGER"]),
    },
    updateAiSettingsHandler
  );

  // Test live connection to the provider
  fastify.post(
    "/ai/test",
    {
      preHandler: requireRole(["ADMIN", "MANAGER"]),
    },
    testAiConnectionHandler
  );
};
