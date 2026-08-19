const {
    createHiringSignalHandler,
    getAllHiringSignalsHandler,
    getHiringSignalByIdHandler,
    updateHiringSignalStatusHandler,
    deleteHiringSignalHandler
} = require("../controllers/hiring-signals.controller");
const { enrichHiringSignalHandler } = require("../controllers/enrichment.controller");

// FIX: these routes had no auth middleware before — anyone could hit them
// without a token. Per SRS §13, listing/reading signals needs MANAGER+;
// create/update/delete are internal pipeline actions, restricted to
// ADMIN/MANAGER (n8n hits these through the separate webhook route with
// its own API-key auth, not this one — see routes/webhookRoutes.js).
const { verifyToken } = require("../middleware/authenticate");
const { requireRole } = require("../middleware/authorize");

module.exports = async function (fastify) {

    fastify.addHook("preHandler", verifyToken);

    fastify.post(
        "/",
        { preHandler: requireRole(["ADMIN", "MANAGER"]) },
        createHiringSignalHandler
    );

    fastify.get(
        "/",
        { preHandler: requireRole(["ADMIN", "MANAGER"]) },
        getAllHiringSignalsHandler
    );

    fastify.get(
        "/:id",
        { preHandler: requireRole(["ADMIN", "MANAGER"]) },
        getHiringSignalByIdHandler
    );

    fastify.patch(
        "/:id/status",
        { preHandler: requireRole(["ADMIN", "MANAGER"]) },
        updateHiringSignalStatusHandler
    );

    // Team 2 (2.2/2.3 Enrichment) — see controllers/enrichment.controller.js
    fastify.post(
        "/:id/enrich",
        { preHandler: requireRole(["ADMIN", "MANAGER"]) },
        enrichHiringSignalHandler
    );

    fastify.delete(
        "/:id",
        { preHandler: requireRole(["ADMIN"]) },
        deleteHiringSignalHandler
    );
};