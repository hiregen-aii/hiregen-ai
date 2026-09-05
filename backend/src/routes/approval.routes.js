// Team 2 (2.5 Lead Management) — Approval Queue routes.
// Repository + controller existed with no route ever registering them.

const {
  getAllApprovalsHandler,
  getApprovalByIdHandler,
  getApprovalsByLeadHandler,
  createApprovalHandler,
  updateApprovalStatusHandler,
  deleteApprovalHandler,
} = require("../controllers/approval.controller");

const { verifyToken } = require("../middleware/authenticate");
const { requireRole } = require("../middleware/authorize");

module.exports = async function (fastify) {
  fastify.addHook("preHandler", verifyToken);

  fastify.get(
    "/",
    { preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER", "VIEWER"]) },
    getAllApprovalsHandler
  );

  fastify.get(
    "/:id",
    { preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER", "VIEWER"]) },
    getApprovalByIdHandler
  );

  fastify.get(
    "/lead/:leadId",
    { preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER", "VIEWER"]) },
    getApprovalsByLeadHandler
  );

  fastify.post(
    "/",
    { preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP"]) },
    createApprovalHandler
  );

  fastify.patch(
    "/:id/status",
    { preHandler: requireRole(["ADMIN", "MANAGER"]) },
    updateApprovalStatusHandler
  );

  fastify.delete(
    "/:id",
    { preHandler: requireRole(["ADMIN", "MANAGER"]) },
    deleteApprovalHandler
  );
};