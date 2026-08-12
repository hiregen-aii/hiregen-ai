const { success, error } = require("../utils/response");

const {
    createHiringSignal,
    getAllHiringSignals,
    getHiringSignalById,
    updateHiringSignalStatus,
    deleteHiringSignal,
    getHiringSignalDetails
} = require("../services/hiring-signals.service");

async function createHiringSignalHandler(request, reply) {
    try {
        const result = await createHiringSignal(request.body);

        return reply.send(
            success(result, request.id)
        );

    } catch (err) {
        return reply
            .code(err.statusCode || 500)
            .send(error(err.message, request.id));
    }
}

async function getAllHiringSignalsHandler(request, reply) {
    try {
        const result = await getAllHiringSignals();

        return reply.send(
            success(result, request.id)
        );

    } catch (err) {
        return reply
            .code(err.statusCode || 500)
            .send(error(err.message, request.id));
    }
}

async function getHiringSignalByIdHandler(request, reply) {
    try {

        const result =
            await getHiringSignalById(request.params.id);

        if (!result) {
            return reply
                .code(404)
                .send(error("Hiring signal not found", request.id));
        }

        return reply.send(
            success(result, request.id)
        );

    } catch (err) {
        return reply
            .code(err.statusCode || 500)
            .send(error(err.message, request.id));
    }
}

async function updateHiringSignalStatusHandler(request, reply) {
    try {

        const result =
            await updateHiringSignalStatus(
                request.params.id,
                request.body.status
            );

        return reply.send(
            success(result, request.id)
        );

    } catch (err) {
        return reply
            .code(err.statusCode || 500)
            .send(error(err.message, request.id));
    }
}

async function deleteHiringSignalHandler(request, reply) {
    try {

        await deleteHiringSignal(request.params.id);

        return reply.send(
            success("Hiring signal deleted", request.id)
        );

    } catch (err) {
        return reply
            .code(err.statusCode || 500)
            .send(error(err.message, request.id));
    }
}

async function getHiringSignalDetailsHandler(request, reply) {
    try {

        const result =
            await getHiringSignalDetails(
                request.params.id
            );

        return reply.send(
            success(result, request.id)
        );

    } catch (err) {
        return reply
            .code(err.statusCode || 500)
            .send(error(err.message, request.id));
    }
}

module.exports = {
    createHiringSignalHandler,
    getAllHiringSignalsHandler,
    getHiringSignalByIdHandler,
    updateHiringSignalStatusHandler,
    deleteHiringSignalHandler,
    getHiringSignalDetailsHandler
};