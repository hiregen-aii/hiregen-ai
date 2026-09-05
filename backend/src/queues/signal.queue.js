/**
 * =====================================
 * TODO (Infrastructure Team)
 *
 * Publish normalizedSignal to BullMQ
 * for downstream enrichment and
 * classification agents.
 *
 * Queue Name:
 * hiring-signals
 *
 * Payload:
 * normalizedSignal
 * =====================================
 */

const { Queue } = require("bullmq");

const connection = {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined
};

const signalQueue = new Queue("signal-processing", {
    connection
});

module.exports = {
    signalQueue,
    connection
};