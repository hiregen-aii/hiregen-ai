const {
  getAllMeetings,
  getMeetingsByLead,
  createMeeting,
} = require("../controllers/meetings.controller");

const { verifyToken } = require("../middleware/authenticate");
const { requireRole } = require("../middleware/authorize");

module.exports = async function (fastify) {
  fastify.addHook("preHandler", verifyToken);

  fastify.get(
    "/",
    { preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER", "VIEWER"]) },
    getAllMeetings
  );

  fastify.get(
    "/lead/:leadId",
    { preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER", "VIEWER"]) },
    getMeetingsByLead
  );

  fastify.post(
    "/",
    { preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER"]) },
    createMeeting
  );
};