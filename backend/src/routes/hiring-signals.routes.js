const {
    createHiringSignalHandler,
    getAllHiringSignalsHandler,
    getHiringSignalByIdHandler,
    updateHiringSignalStatusHandler,
    deleteHiringSignalHandler
} = require("../controllers/hiring-signals.controller");

module.exports = async function (fastify) {

    fastify.post(
        "/",
        createHiringSignalHandler
    );

    fastify.get(
        "/",
        getAllHiringSignalsHandler
    );

    fastify.get(
        "/:id",
        getHiringSignalByIdHandler
    );

    fastify.patch(
        "/:id/status",
        updateHiringSignalStatusHandler
    );

    fastify.delete(
        "/:id",
        deleteHiringSignalHandler
    );
};