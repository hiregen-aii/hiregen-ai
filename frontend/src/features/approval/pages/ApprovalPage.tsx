import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";


import { useApprovals } from "@/hooks/useApprovals";
import { useEnrichedLeads } from "@/features/leads/hooks/useEnrichedLeads";
import { useAuthStore } from "@/store/auth-store";
import { updateApprovalStatus, updateApprovalDraftContent } from "@/services/approval.service";
import { scheduleMeeting } from "@/services/meetings.service";
import type { ApprovalStatus } from "@/types/approval";
import type { ApprovalDraft } from "@/data/approval";

import ApprovalTable from "@/components/approval/ApprovalTable";
import ReviewDraftModal from "@/components/approval/ReviewDraftModal";
import ConfirmApproveModal from "@/components/approval/ConfirmApproveModal";
import ConfirmRejectModal from "@/components/approval/ConfirmRejectModal";
import MeetingSchedulerModal from "@/components/leads/MeetingSchedulerModal";
import Toast from "@/components/common/Toast";
import { Zap, ShieldCheck, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchAutopilotStatus, updateAutopilotConfig, runAutopilotNow } from "@/services/autopilot.service";

const ApprovalPage = () => {
  const queryClient = useQueryClient();
  const role = useAuthStore((s) => s.user?.role);
  const canReview = role === "ADMIN" || role === "MANAGER" || role === "SALES_REP";

  const { data: approvals, isLoading, isError, error } = useApprovals();
  const { enrichedLeads } = useEnrichedLeads();

  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("Pending");
  const [activeReviewDraft, setActiveReviewDraft] = useState<ApprovalDraft | null>(null);
  const [confirmApproveDraft, setConfirmApproveDraft] = useState<ApprovalDraft | null>(null);
  const [confirmRejectDraft, setConfirmRejectDraft] = useState<ApprovalDraft | null>(null);
  const [schedulingLead, setSchedulingLead] = useState<any | null>(null);

  // Toast notification state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastTitle, setToastTitle] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "edit" | "delete" | "meeting">("success");

  const showToast = (title: string, message: string, type: "success" | "edit" | "delete" | "meeting") => {
    setToastTitle(title);
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  // Autopilot query and mutation state
  const { data: autopilotStatus } = useQuery({
    queryKey: ["autopilot-status"],
    queryFn: fetchAutopilotStatus,
  });
  const isAutopilot = Boolean(autopilotStatus?.isEnabled);
  const [isRunningAutopilot, setIsRunningAutopilot] = useState(false);

  const handleToggleAutopilot = async (enabled: boolean) => {
    if (!canReview) {
      showToast("Not Allowed", "Your role does not have permission to modify outreach modes.", "delete");
      return;
    }
    try {
      await updateAutopilotConfig({ enabled });
      await queryClient.invalidateQueries({ queryKey: ["autopilot-status"] });
      showToast(
        enabled ? "Autopilot Activated" : "Manual Mode Activated",
        enabled
          ? "Zero-touch automated outreach is active for high-fit leads."
          : "Human-in-the-loop review mode active. Drafts await recruiter approval.",
        "success"
      );
    } catch (err) {
      showToast("Update Failed", err instanceof Error ? err.message : "Failed to toggle mode", "delete");
    }
  };

  const handleRunAutopilotNow = async () => {
    if (!canReview) {
      showToast("Not Allowed", "Your role does not have permission to trigger autopilot runs.", "delete");
      return;
    }
    setIsRunningAutopilot(true);
    try {
      const res = await runAutopilotNow();
      await queryClient.invalidateQueries({ queryKey: ["approvals"] });
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      await queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
      await queryClient.invalidateQueries({ queryKey: ["autopilot-status"] });
      showToast(
        "Autopilot Completed",
        `Dispatched ${res.dispatched} emails (${res.failed} failed) for leads with fit score ≥ ${res.threshold}%.`,
        "success"
      );
    } catch (err) {
      showToast("Autopilot Failed", err instanceof Error ? err.message : "Autopilot run encountered an error", "delete");
    } finally {
      setIsRunningAutopilot(false);
    }
  };

  const leadMap = useMemo(() => new Map(enrichedLeads.map((l) => [l.id, l])), [enrichedLeads]);

  // Map live PostgreSQL approvals into high-fidelity ApprovalDraft objects
  const drafts: ApprovalDraft[] = useMemo(() => {
    return (approvals ?? []).map((a: any) => {
      const lead = leadMap.get(a.lead_id);
      const company = a.company || lead?.company || "Target Company";
      const industry = a.industry || lead?.industry || "Technology";
      const contact = a.contact || lead?.contact || "Hiring Lead";
      const email = a.email || lead?.email || `recruiting@${company.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
      const jobTitle = a.job_title || lead?.type || "Technical Requisition";
      const aiScore = a.fit_score || lead?.score || 85;

      let status: ApprovalDraft["status"] = "Pending";
      if (a.status === "APPROVED") status = "Approved";
      else if (a.status === "REJECTED") status = "Rejected";

      return {
        id: a.id,
        leadId: a.lead_id,
        company,
        industry,
        contact,
        email,
        jobTitle,
        aiScore: Math.round(Number(aiScore)),
        status,
        generatedOn: new Date(a.created_at).toLocaleDateString(),
        subject: a.draft_subject,
        body: a.draft_body,
      };
    });
  }, [approvals, leadMap]);

  // Filtered drafts based on selected filter
  const filteredDrafts = useMemo(() => {
    if (statusFilter === "All") return drafts;
    return drafts.filter((d) => d.status === statusFilter);
  }, [drafts, statusFilter]);

  // Save edited draft
  const handleSaveDraft = async (draft: ApprovalDraft) => {
    try {
      await updateApprovalDraftContent(String(draft.id), draft.subject, draft.body);
      await queryClient.invalidateQueries({ queryKey: ["approvals"] });
      showToast("Draft Saved", "Email subject and body updated successfully.", "edit");
    } catch (err) {
      showToast("Save Failed", err instanceof Error ? err.message : "Failed to save draft", "delete");
    }
  };

  // Perform approve action and trigger automated email dispatch
  const handleApprove = async (draft: ApprovalDraft) => {
    if (!canReview) {
      showToast("Not Allowed", "Your role does not have permission to approve drafts.", "delete");
      return;
    }
    try {
      await updateApprovalStatus(String(draft.id), "APPROVED" as ApprovalStatus);
      await queryClient.invalidateQueries({ queryKey: ["approvals"] });
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      await queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
      setActiveReviewDraft(null);
      setConfirmApproveDraft(null);
      showToast(
        "Draft Approved & Email Dispatched",
        `Outreach email to ${draft.contact} (${draft.company}) has been dispatched.`,
        "success"
      );
    } catch (err) {
      showToast("Approval Failed", err instanceof Error ? err.message : "Failed to approve draft", "delete");
    }
  };

  // Perform reject action
  const handleReject = async (draft: ApprovalDraft) => {
    if (!canReview) {
      showToast("Not Allowed", "Your role does not have permission to reject drafts.", "delete");
      return;
    }
    try {
      await updateApprovalStatus(String(draft.id), "REJECTED" as ApprovalStatus);
      await queryClient.invalidateQueries({ queryKey: ["approvals"] });
      setActiveReviewDraft(null);
      setConfirmRejectDraft(null);
      showToast("Draft Rejected", `Draft for ${draft.company} has been marked as rejected.`, "delete");
    } catch (err) {
      showToast("Reject Failed", err instanceof Error ? err.message : "Failed to reject draft", "delete");
    }
  };

  // Schedule meeting from review modal
  const handleScheduleFromReview = () => {
    if (!activeReviewDraft) return;
    const lead = leadMap.get(activeReviewDraft.leadId || "");
    setSchedulingLead(lead || { id: activeReviewDraft.leadId, company: activeReviewDraft.company });
    setActiveReviewDraft(null);
  };

  const handleConfirmSchedule = async (date: string, time: string, link: string, notes: string) => {
    if (!schedulingLead) return;
    try {
      await scheduleMeeting({
        leadId: schedulingLead.id,
        date,
        time,
        link,
        notes,
      });
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      await queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
      showToast("Meeting Scheduled", `Meeting with ${schedulingLead.company} scheduled successfully.`, "meeting");
    } catch (err) {
      showToast("Scheduling Failed", err instanceof Error ? err.message : "Failed to book meeting", "delete");
    } finally {
      setSchedulingLead(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Approval Queue</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Review and approve AI-generated outreach emails before automated dispatch.
          </p>
        </div>

        <div className="flex gap-2">
          {(["Pending", "Approved", "Rejected", "All"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                statusFilter === s
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Autopilot & Manual Mode Control Banner */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-[#111827]">
        <div className="flex items-center gap-3">
          <div
            className={`rounded-xl p-2.5 ${
              isAutopilot
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                : "bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400"
            }`}
          >
            {isAutopilot ? <Zap size={22} className="animate-pulse" /> : <ShieldCheck size={22} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 dark:text-white">
                {isAutopilot ? "Autopilot Mode (Active)" : "Manual Review Mode (Human-in-the-Loop)"}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  isAutopilot
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    : "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                }`}
              >
                {isAutopilot ? "Autonomous Dispatch" : "Review-Before-Send"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {isAutopilot
                ? `Zero-touch outreach emails are automatically dispatched to leads with fit score ≥ ${
                    autopilotStatus?.minFitScore || 85
                  }%.`
                : "All AI drafts are held safely in the queue for manual recruiter approval and editing."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRunAutopilotNow}
            disabled={isRunningAutopilot}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            title="Immediately dispatch all pending drafts meeting the fit score threshold"
          >
            <Play size={14} className={isRunningAutopilot ? "animate-spin" : ""} />
            {isRunningAutopilot ? "Dispatching..." : "Run Autopilot Now"}
          </button>

          <button
            onClick={() => handleToggleAutopilot(!isAutopilot)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-sm transition ${
              isAutopilot
                ? "bg-slate-700 hover:bg-slate-800 dark:bg-slate-600"
                : "bg-violet-600 hover:bg-violet-700"
            }`}
          >
            {isAutopilot ? "Switch to Manual Mode" : "Switch to Autopilot"}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error instanceof Error ? error.message : "Failed to load approvals"}
        </div>
      )}

      {!isLoading && !isError && (
        <ApprovalTable
          drafts={filteredDrafts}
          onReview={(draft) => setActiveReviewDraft(draft)}
        />
      )}

      {/* Review Draft Modal */}
      <ReviewDraftModal
        open={Boolean(activeReviewDraft)}
        draft={activeReviewDraft}
        onClose={() => setActiveReviewDraft(null)}
        onSave={handleSaveDraft}
        onApprove={() => activeReviewDraft && setConfirmApproveDraft(activeReviewDraft)}
        onReject={() => activeReviewDraft && setConfirmRejectDraft(activeReviewDraft)}
        onSchedule={handleScheduleFromReview}
      />

      {/* Confirm Approve Modal */}
      <ConfirmApproveModal
        open={Boolean(confirmApproveDraft)}
        draft={confirmApproveDraft}
        onClose={() => setConfirmApproveDraft(null)}
        onConfirm={handleApprove}
      />

      {/* Confirm Reject Modal */}
      <ConfirmRejectModal
        open={Boolean(confirmRejectDraft)}
        draft={confirmRejectDraft}
        onClose={() => setConfirmRejectDraft(null)}
        onConfirm={handleReject}
      />

      {/* Meeting Scheduler Modal */}
      <MeetingSchedulerModal
        open={Boolean(schedulingLead)}
        lead={schedulingLead}
        onClose={() => setSchedulingLead(null)}
        onSchedule={handleConfirmSchedule}
      />

      {/* Toast notifications */}
      <Toast
        open={toastOpen}
        title={toastTitle}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
};

export default ApprovalPage;