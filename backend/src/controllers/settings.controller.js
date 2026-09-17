const aiSettingsService = require("../services/aiSettings.service");

/**
 * GET /api/v1/settings/ai
 * Returns active AI provider and model settings with masked keys.
 */
async function getAiSettingsHandler(request, reply) {
  try {
    const data = await aiSettingsService.getPublicAiSettings();
    return reply.send({
      success: true,
      data,
    });
  } catch (err) {
    return reply.code(500).send({
      success: false,
      message: `Failed to retrieve AI settings: ${err.message}`,
    });
  }
}

/**
 * PUT /api/v1/settings/ai
 * Updates active AI provider, model, custom endpoint, and optional API key.
 */
async function updateAiSettingsHandler(request, reply) {
  try {
    const { provider, model, apiKey, customBaseUrl, temperature } = request.body || {};
    const updated = await aiSettingsService.updateAiSettings({
      provider,
      model,
      apiKey,
      customBaseUrl,
      temperature,
    });

    return reply.send({
      success: true,
      message: "AI configuration saved successfully",
      data: updated,
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: `Failed to update AI settings: ${err.message}`,
    });
  }
}

/**
 * POST /api/v1/settings/ai/test
 * Tests live connection for a chosen provider and model.
 */
async function testAiConnectionHandler(request, reply) {
  try {
    const { provider, model, apiKey, customBaseUrl } = request.body || {};
    const testResult = await aiSettingsService.testAiConnection({
      provider,
      model,
      apiKey,
      customBaseUrl,
    });

    return reply.send({
      success: true,
      data: testResult,
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
}

module.exports = {
  getAiSettingsHandler,
  updateAiSettingsHandler,
  testAiConnectionHandler,
};
