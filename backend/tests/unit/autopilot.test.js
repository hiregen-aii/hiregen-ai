const { test, describe } = require("node:test");
const assert = require("node:assert");
const autopilotService = require("../../src/services/autopilot.service");

describe("Autopilot Service & Mode Switching", () => {
  test("getAutopilotConfig returns valid defaults and threshold", () => {
    const config = autopilotService.getAutopilotConfig();
    assert.strictEqual(typeof config.isEnabled, "boolean");
    assert.strictEqual(typeof config.minFitScore, "number");
    assert.ok(config.minFitScore >= 50 && config.minFitScore <= 100);
  });

  test("setAutopilotConfig toggles state and updates threshold", () => {
    const updated = autopilotService.setAutopilotConfig({ enabled: true, minFitScore: 90 });
    assert.strictEqual(updated.isEnabled, true);
    assert.strictEqual(updated.minFitScore, 90);
    assert.strictEqual(autopilotService.isAutopilotActive(), true);
    assert.strictEqual(autopilotService.getThreshold(), 90);

    // Revert to manual mode
    const reverted = autopilotService.setAutopilotConfig({ enabled: false, minFitScore: 85 });
    assert.strictEqual(reverted.isEnabled, false);
    assert.strictEqual(autopilotService.isAutopilotActive(), false);
    assert.strictEqual(autopilotService.getThreshold(), 85);
  });
});
