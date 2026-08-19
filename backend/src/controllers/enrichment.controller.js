// Team 2 (2.2/2.3 Company + Contact Intelligence)
const { runEnrichmentPipeline } = require("../agents/enrichment.agent");
const AppError = require("../utils/AppError");

const enrichHiringSignalHandler = async (request, reply) => {
  try {
    const { id } = request.params;
    const { company, contact } = request.body || {};

    const result = await runEnrichmentPipeline(id, { company, contact });

    return reply.send({
      success: true,
      message: "Enrichment completed",
      data: result,
    });
  } catch (err) {
    request.log.error(err);
    if (err instanceof AppError) {
      return reply.code(err.statusCode).send({ success: false, message: err.message });
    }
    const statusCode = /not found|no company_id/i.test(err.message) ? 400 : 500;
    return reply.code(statusCode).send({ success: false, message: err.message });
  }
};

module.exports = { enrichHiringSignalHandler };