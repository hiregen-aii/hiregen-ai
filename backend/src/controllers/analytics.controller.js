// Analytics — repositories existed (analyticsDaily / analyticsMonthly),
// no controller/route. Read-only from the API: these tables are meant to
// be populated by an internal rollup job, not written to by clients.

const { getAllAnalyticsDaily, getAnalyticsByDate } = require("../repositories/analyticsDaily.repository");
const {
  getAllAnalyticsMonthly,
  getAnalyticsMonthly,
} = require("../repositories/analyticsMonthly.repository");

const AppError = require("../utils/AppError");

const getAllDailyHandler = async (request, reply) => {
  try {
    const rows = await getAllAnalyticsDaily();
    return reply.send({ success: true, data: rows });
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send({ success: false, message: err.message });
  }
};

const getDailyByDateHandler = async (request, reply) => {
  try {
    const { reportDate } = request.params;
    const row = await getAnalyticsByDate(reportDate);

    if (!row) {
      throw new AppError("No analytics for that date", 404);
    }

    return reply.send({ success: true, data: row });
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send({ success: false, message: err.message });
  }
};

const getAllMonthlyHandler = async (request, reply) => {
  try {
    const rows = await getAllAnalyticsMonthly();
    return reply.send({ success: true, data: rows });
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send({ success: false, message: err.message });
  }
};

const getMonthlyByMonthHandler = async (request, reply) => {
  try {
    const { reportMonth } = request.params;
    const row = await getAnalyticsMonthly(reportMonth);

    if (!row) {
      throw new AppError("No analytics for that month", 404);
    }

    return reply.send({ success: true, data: row });
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send({ success: false, message: err.message });
  }
};

module.exports = {
  getAllDailyHandler,
  getDailyByDateHandler,
  getAllMonthlyHandler,
  getMonthlyByMonthHandler,
};