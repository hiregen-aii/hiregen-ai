const {
  getAllCampaignsHandler,
  getCampaignByIdHandler,
  createCampaignHandler,
  updateCampaignHandler,
  deleteCampaignHandler,
} = require("../controllers/campaigns.controller");

const { verifyToken } = require("../middleware/authenticate");
const { requireRole } = require("../middleware/authorize");

module.exports = async function (fastify) {
  fastify.addHook("preHandler", verifyToken);

  fastify.get(
    "/",
    { preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER", "VIEWER"]) },
    getAllCampaignsHandler
  );

  fastify.get(
    "/:id",
    { preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER", "VIEWER"]) },
    getCampaignByIdHandler
  );

  fastify.post(
    "/",
    { preHandler: requireRole(["ADMIN", "MANAGER"]) },
    createCampaignHandler
  );

  fastify.patch(
    "/:id",
    { preHandler: requireRole(["ADMIN", "MANAGER"]) },
    updateCampaignHandler
  );

  fastify.delete(
    "/:id",
    { preHandler: requireRole(["ADMIN", "MANAGER"]) },
    deleteCampaignHandler
  );
};