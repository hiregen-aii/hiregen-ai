import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { downloadLeadsExport, triggerDeepScrape } from "../export.service";
import { api } from "../api";

vi.mock("../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("Frontend Export & Scraper Service", () => {
  let clickedElement: any = null;

  beforeEach(() => {
    vi.clearAllMocks();
    clickedElement = null;

    // Polyfill global window & document for Node vitest environment
    (globalThis as any).window = {
      URL: {
        createObjectURL: vi.fn().mockReturnValue("blob:http://localhost/mock-uuid"),
        revokeObjectURL: vi.fn(),
      },
    };

    (globalThis as any).document = {
      createElement: vi.fn().mockImplementation((tagName: string) => {
        const el = {
          tagName,
          setAttribute: vi.fn(),
          click: vi.fn().mockImplementation(() => {
            clickedElement = el;
          }),
          remove: vi.fn(),
          href: "",
        };
        return el;
      }),
      body: {
        appendChild: vi.fn(),
      },
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("triggers CSV download with correct URL and headers when called with defaults", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: "col1,col2\nval1,val2" });

    await downloadLeadsExport("csv");

    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining("/export/leads?format=csv"),
      { responseType: "blob" }
    );
    expect(clickedElement).not.toBeNull();
  });

  it("triggers Excel download and sets .xlsx extension", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: new Uint8Array([1, 2, 3]) });

    await downloadLeadsExport("xlsx");

    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining("/export/leads?format=xlsx"),
      { responseType: "blob" }
    );
    expect(clickedElement).not.toBeNull();
  });

  it("serializes search and filter options correctly", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: "csv-data" });

    await downloadLeadsExport("csv", {
      search: "Stripe",
      status: "NEW",
      hiringType: "FULL_TIME",
      minScore: "80+",
    });

    const calledUrl = vi.mocked(api.get).mock.calls[0][0];
    expect(calledUrl).toContain("search=Stripe");
    expect(calledUrl).toContain("status=NEW");
    expect(calledUrl).toContain("hiringType=FULL_TIME");
    expect(calledUrl).toContain("minScore=80%2B");
  });

  it("omits 'All' filter options so backend defaults are used", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: "csv-data" });

    await downloadLeadsExport("csv", {
      search: "",
      status: "All",
      hiringType: "All",
      minScore: "All",
    });

    const calledUrl = vi.mocked(api.get).mock.calls[0][0];
    expect(calledUrl).not.toContain("status=");
    expect(calledUrl).not.toContain("hiringType=");
    expect(calledUrl).not.toContain("minScore=");
  });

  it("calls /scraper/trigger with target params and returns scrape stats", async () => {
    const mockStats = {
      totalFound: 25,
      newlyAdded: 15,
      duplicatesSkipped: 10,
      leadsCreated: 15,
    };

    vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        success: true,
        message: "Scrape complete",
        data: mockStats,
      },
    });

    const result = await triggerDeepScrape("Python", "Remote", "FULL_TIME");

    expect(api.post).toHaveBeenCalledWith(
      "/scraper/trigger",
      {
        query: "Python",
        location: "Remote",
        hiringType: "FULL_TIME",
      },
      { timeout: 60000 }
    );
    expect(result).toEqual(mockStats);
  });
});
