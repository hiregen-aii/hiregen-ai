const {
  createContact,
  getAllContacts,
  getContactById,
} = require("../controllers/contacts.controller");

const { verifyToken } = require("../middleware/authenticate");
const { requireRole } = require("../middleware/authorize");

module.exports = async function (fastify) {
  fastify.addHook("preHandler", verifyToken);

  fastify.post("/", { preHandler: requireRole(["ADMIN", "MANAGER"]) }, createContact);
  fastify.get(
    "/",
    { preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER", "VIEWER"]) },
    getAllContacts
  );
  fastify.get(
    "/:id",
    { preHandler: requireRole(["ADMIN", "MANAGER", "SALES_REP", "RECRUITER", "VIEWER"]) },
    getContactById
  );
};