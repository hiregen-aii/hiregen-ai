const autopilotService = require("../services/autopilot.service");

/**
 * Returns current Autopilot mode configuration & statistics.
 */
const getAutopilotStatusHandler = async (request, reply) => {
  try {
    const config = autopilotService.getAutopilotConfig();
    return reply.send({ success: true, data: config });
  } catch (err) {
    return reply.code(500).send({ success: false, message: err.message });
  }
};

/**
 * Toggles Autopilot Mode (Manual vs Autopilot) and updates threshold.
 */
const setAutopilotConfigHandler = async (request, reply) => {
  try {
    const body = request.body || {};
    const { enabled, minFitScore } = body;
    const updated = autopilotService.setAutopilotConfig({ enabled, minFitScore });
    return reply.send({
      success: true,
      message: `Outreach mode switched to ${updated.isEnabled ? "AUTOPILOT (Zero-Touch)" : "MANUAL (Human-in-the-Loop)"}.`,
      data: updated,
    });
  } catch (err) {
    return reply.code(500).send({ success: false, message: err.message });
  }
};

/**
 * Triggers an immediate Autopilot batch run for eligible high-fit leads.
 */
const runAutopilotNowHandler = async (request, reply) => {
  try {
    const result = await autopilotService.runAutopilotBatch();
    return reply.send({
      success: true,
      message: `Autopilot run complete: ${result.dispatched} dispatched, ${result.failed} failed out of ${result.totalEligible} eligible.`,
      data: result,
    });
  } catch (err) {
    return reply.code(500).send({ success: false, message: err.message });
  }
};

module.exports = {
  getAutopilotStatusHandler,
  setAutopilotConfigHandler,
  runAutopilotNowHandler,
};
