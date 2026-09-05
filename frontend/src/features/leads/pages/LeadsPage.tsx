import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useNotifications } from "@/context/NotificationContext";
import { useAuthStore } from "@/store/auth-store";
import { useEnrichedLeads, type EnrichedLead } from "@/features/leads/hooks/useEnrichedLeads";
import { updateLead } from "@/services/leads-mutations.service";

import LeadStats from "@/components/leads/LeadStats";
import LeadSearchBar from "@/components/leads/LeadSearchBar";
import LeadsTable from "@/components/leads/LeadsTable";
import LeadDetails from "@/components/leads/LeadDetails";
import Toast from "@/components/common/Toast";

const LeadsPage = () => {
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();
  const role = useAuthStore((s) => s.user?.role);
  const canManageLeads = role === "ADMIN" || role === "MANAGER" || role === "SALES_REP";

  const { enrichedLeads, isLoading, isError, error } = useEnrichedLeads();

  const [selectedLead, setSelectedLead] = useState<EnrichedLead | null>(null);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastTitle, setToastTitle] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "edit" | "delete" | "meeting">("success");

  const [search, setSearch] = useState("");
  const [source, setSource] = useState("All Sources");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [scoreFilter, setScoreFilter] = useState("All");

  const showToast = (title: string, message: string, type: "success" | "edit" | "delete" | "meeting") => {
    setToastTitle(title);
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  const filteredLeads = useMemo(() => {
    return enrichedLeads.filter((lead) => {
      const q = search.toLowerCase();
      const matchesSearch =
        lead.company.toLowerCase().includes(q) ||
        lead.contact.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
      const matchesType = typeFilter === "All" || lead.type === typeFilter;
      const matchesScore =
        scoreFilter === "All" ||
        (scoreFilter === "70+" && lead.score >= 70) ||
        (scoreFilter === "80+" && lead.score >= 80) ||
        (scoreFilter === "90+" && lead.score >= 90);

      // NOTE: "source" isn't resolvable from /leads alone (would need the
      // linked hiring_signal, which is an ADMIN/MANAGER-only endpoint) —
      // the source filter is a no-op for now until that's wired up.
      return matchesSearch && matchesStatus && matchesType && matchesScore;
    });
  }, [enrichedLeads, search, statusFilter, typeFilter, scoreFilter]);

  // Real action: mark a lead as having a meeting booked via PATCH /leads/:id.
  // There's no `meetings` table/endpoint on the backend — this updates the
  // lead's stage, it doesn't create a calendar event.
  const handleMarkMeetingBooked = async (lead: EnrichedLead) => {
    if (!canManageLeads) {
      showToast("Not allowed", "Your role can't update lead stages.", "delete");
      return;
    }
    try {
      await updateLead(lead.id, { stage: "MEETING_BOOKED" });
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      addNotification({
        title: "Meeting Booked",
        message: `${lead.company} marked as Meeting Booked.`,
        type: "meeting",
      });
      showToast("Meeting Booked", `${lead.company} marked as Meeting Booked.`, "meeting");
    } catch (err) {
      showToast("Update failed", err instanceof Error ? err.message : "Could not update lead", "delete");
    }
  };

  const handleAddLeadClick = () => {
    showToast(
      "Coming soon",
      "Adding a lead needs a company + hiring-signal picker — not wired up yet.",
      "edit"
    );
  };

  const handleDeleteLeadClick = (lead: EnrichedLead) => {
    showToast("Not supported", `The backend has no delete endpoint for leads (${lead.company}).`, "delete");
  };

  const handleEditLeadClick = (lead: EnrichedLead) => {
    showToast("Coming soon", `Editing ${lead.company} — full edit form isn't wired up yet.`, "edit");
  };

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
        Couldn't load leads: {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Lead Management</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Manage recruitment leads and outreach campaigns.
          </p>
        </div>

        <LeadStats leads={enrichedLeads} />

        <LeadSearchBar
          search={search}
          setSearch={setSearch}
          source={source}
          setSource={setSource}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          scoreFilter={scoreFilter}
          setScoreFilter={setScoreFilter}
          onAddLead={handleAddLeadClick}
        />

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 xl:col-span-8">
            {isLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-400">
                Loading leads…
              </div>
            ) : (
              <LeadsTable
                leads={filteredLeads}
                selectedLead={selectedLead}
                setSelectedLead={setSelectedLead}
                onEditLead={handleEditLeadClick}
                onDeleteLead={handleDeleteLeadClick}
              />
            )}
          </div>

          <div className="col-span-12 xl:col-span-4">
            <LeadDetails selectedLead={selectedLead} onScheduleMeeting={handleMarkMeetingBooked} />
          </div>
        </div>
      </div>

      <Toast
        open={toastOpen}
        title={toastTitle}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />  
    </>
  );
};

export default LeadsPage;