import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Clock, Mail } from "lucide-react";

import { useApprovals } from "@/hooks/useApprovals";
import { useEnrichedLeads } from "@/features/leads/hooks/useEnrichedLeads";
import { useAuthStore } from "@/store/auth-store";
import { updateApprovalStatus } from "@/services/approval.service";
import type { Approval, ApprovalStatus } from "@/types/approval";

const STATUS_STYLES: Record<ApprovalStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  APPROVED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

const ApprovalPage = () => {
  const queryClient = useQueryClient();
  const role = useAuthStore((s) => s.user?.role);
  const canReview = role === "ADMIN" || role === "MANAGER";

  const { data: approvals, isLoading, isError, error } = useApprovals();
  const { enrichedLeads } = useEnrichedLeads();
  const [statusFilter, setStatusFilter] = useState<"All" | ApprovalStatus>("PENDING");
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const leadMap = useMemo(() => new Map(enrichedLeads.map((l) => [l.id, l])), [enrichedLeads]);

  const filtered = useMemo(() => {
    const list = approvals ?? [];
    if (statusFilter === "All") return list;
    return list.filter((a) => a.status === statusFilter);
  }, [approvals, statusFilter]);

  const handleAction = async (approval: Approval, status: ApprovalStatus) => {
    setActionError(null);
    setActioningId(approval.id);
    try {
      await updateApprovalStatus(approval.id, status);
      await queryClient.invalidateQueries({ queryKey: ["approvals"] });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update approval");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Approval Queue</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Review and approve outreach drafts before they're sent.
        </p>
      </div>

      <div className="flex gap-2">
        {(["PENDING", "APPROVED", "REJECTED", "All"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              statusFilter === s
                ? "bg-violet-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {s === "All" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {actionError}
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error instanceof Error ? error.message : "Failed to load approvals"}
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-[#111827]">
          <Clock className="mb-3 h-8 w-8 text-slate-300" />
          <p className="text-slate-500 dark:text-slate-400">No {statusFilter.toLowerCase()} approvals.</p>
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((approval) => {
            const lead = leadMap.get(approval.lead_id);

            return (
              <div
                key={approval.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-[#111827]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
                      <Mail className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {lead?.company ?? "Unknown company"}
                        <span className="ml-2 text-sm font-normal text-slate-400">
                          Step {approval.step_number}
                        </span>
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        To: {lead?.contact ?? "No contact linked"}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[approval.status]}`}>
                    {approval.status}
                  </span>
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                  <p className="font-medium text-slate-900 dark:text-white">{approval.draft_subject}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
                    {approval.draft_body}
                  </p>
                </div>

                {approval.status === "PENDING" && canReview && (
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => handleAction(approval, "APPROVED")}
                      disabled={actioningId === approval.id}
                      className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(approval, "REJECTED")}
                      disabled={actioningId === approval.id}
                      className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                )}

                {approval.status === "PENDING" && !canReview && (
                  <p className="mt-4 text-xs text-slate-400">
                    Only ADMIN/MANAGER can approve or reject drafts.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ApprovalPage;