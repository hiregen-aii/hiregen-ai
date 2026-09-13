import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "../api";
import { fetchApprovals, updateApprovalStatus, updateApprovalDraftContent } from "../approval.service";
import { scheduleMeeting, fetchMeetings } from "../meetings.service";

vi.mock("../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
  extractErrorMessage: vi.fn((_err, fallback) => fallback),
}));

describe("Approval & Meeting Services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetchApprovals calls GET /approval and returns data", async () => {
    const mockData = [{ id: "app-1", draft_subject: "Hello" }];
    (api.get as any).mockResolvedValueOnce({ data: { data: mockData } });

    const result = await fetchApprovals();
    expect(api.get).toHaveBeenCalledWith("/approval");
    expect(result).toEqual(mockData);
  });

  it("updateApprovalStatus calls PATCH /approval/:id/status", async () => {
    (api.patch as any).mockResolvedValueOnce({ data: { data: { id: "app-1", status: "APPROVED" } } });

    const result = await updateApprovalStatus("app-1", "APPROVED");
    expect(api.patch).toHaveBeenCalledWith("/approval/app-1/status", { status: "APPROVED" });
    expect(result.status).toBe("APPROVED");
  });

  it("updateApprovalDraftContent calls PATCH /approval/:id with subject and body", async () => {
    (api.patch as any).mockResolvedValueOnce({ data: { data: { id: "app-1", draft_subject: "Updated", draft_body: "New text" } } });

    const result = await updateApprovalDraftContent("app-1", "Updated", "New text");
    expect(api.patch).toHaveBeenCalledWith("/approval/app-1", { draftSubject: "Updated", draftBody: "New text" });
    expect(result.draft_subject).toBe("Updated");
  });

  it("scheduleMeeting calls POST /meetings with input payload", async () => {
    const payload = {
      leadId: "lead-123",
      date: "2026-09-20",
      time: "14:00",
      link: "https://meet.google.com/test",
      notes: "Screening call",
    };
    (api.post as any).mockResolvedValueOnce({ data: { success: true, data: { id: "meet-1" } } });

    const result = await scheduleMeeting(payload);
    expect(api.post).toHaveBeenCalledWith("/meetings", payload);
    expect(result.success).toBe(true);
  });

  it("fetchMeetings calls GET /meetings and returns array", async () => {
    (api.get as any).mockResolvedValueOnce({ data: { data: [{ id: "meet-1" }] } });

    const result = await fetchMeetings();
    expect(api.get).toHaveBeenCalledWith("/meetings");
    expect(result.length).toBe(1);
  });
});
