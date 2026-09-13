import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "../api";
import {
  fetchAutopilotStatus,
  updateAutopilotConfig,
  runAutopilotNow,
} from "../autopilot.service";

vi.mock("../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
  extractErrorMessage: vi.fn((_err, fallback) => fallback),
}));

describe("Autopilot Service Frontend Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetchAutopilotStatus calls GET /autopilot/status and returns configuration", async () => {
    const mockStatus = {
      isEnabled: true,
      minFitScore: 85,
      lastRunAt: "2026-09-13T12:00:00.000Z",
      totalDispatched: 12,
    };
    (api.get as any).mockResolvedValueOnce({ data: { data: mockStatus } });

    const result = await fetchAutopilotStatus();
    expect(api.get).toHaveBeenCalledWith("/autopilot/status");
    expect(result).toEqual(mockStatus);
  });

  it("updateAutopilotConfig calls POST /autopilot/config with payload", async () => {
    const payload = { enabled: false, minFitScore: 90 };
    (api.post as any).mockResolvedValueOnce({ data: { data: { isEnabled: false, minFitScore: 90 } } });

    const result = await updateAutopilotConfig(payload);
    expect(api.post).toHaveBeenCalledWith("/autopilot/config", payload);
    expect(result.isEnabled).toBe(false);
  });

  it("runAutopilotNow calls POST /autopilot/run-now and returns dispatch summary", async () => {
    const mockRunResult = {
      totalEligible: 5,
      dispatched: 5,
      failed: 0,
      threshold: 85,
      executedAt: "2026-09-13T12:30:00.000Z",
    };
    (api.post as any).mockResolvedValueOnce({ data: { data: mockRunResult } });

    const result = await runAutopilotNow();
    expect(api.post).toHaveBeenCalledWith("/autopilot/run-now", {});
    expect(result.dispatched).toBe(5);
    expect(result.failed).toBe(0);
  });
});
