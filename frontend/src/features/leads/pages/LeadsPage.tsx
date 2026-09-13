import { useMemo, useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useNotifications } from "@/context/NotificationContext";
import { useAuthStore } from "@/store/auth-store";
import { useEnrichedLeads, type EnrichedLead } from "@/features/leads/hooks/useEnrichedLeads";
import { updateLead, createLead, deleteLead } from "@/services/leads-mutations.service";
import type { LeadStage } from "@/types/lead";

import LeadStats from "@/components/leads/LeadStats";
import LeadSearchBar from "@/components/leads/LeadSearchBar";
import LeadsTable from "@/components/leads/LeadsTable";
import LeadDetails from "@/components/leads/LeadDetails";
import AddLeadModal, { type NewLeadFormData } from "@/components/leads/AddLeadModal";
import EditLeadModal from "@/components/leads/EditLeadModal";
import MeetingSchedulerModal from "@/components/leads/MeetingSchedulerModal";
import { Download, RefreshCw, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import Toast from "@/components/common/Toast";
import { downloadLeadsExport, downloadBothLeadsExport, triggerDeepScrape } from "@/services/export.service";
import { scheduleMeeting } from "@/services/meetings.service";
import { extractErrorMessage } from "@/services/api";

const LeadsPage = () => {
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();
  const role = useAuthStore((s) => s.user?.role);
  const canManageLeads = role === "ADMIN" || role === "MANAGER" || role === "SALES_REP";

  const { enrichedLeads, isLoading, isError, error } = useEnrichedLeads();

  const [selectedLead, setSelectedLead] = useState<EnrichedLead | null>(null);
  const [editingLead, setEditingLead] = useState<EnrichedLead | null>(null);
  const [schedulingLead, setSchedulingLead] = useState<EnrichedLead | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

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

  const [isScraping, setIsScraping] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const detailsPanelRef = useRef<HTMLDivElement>(null);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    if (exportMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [exportMenuOpen]);

  // Scroll details panel back to top when selecting a lead
  useEffect(() => {
    if (selectedLead && detailsPanelRef.current) {
      detailsPanelRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selectedLead?.id]);

  const handleDeepScrape = async () => {
    setIsScraping(true);
    try {
      const stats = await triggerDeepScrape();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["leads"] }),
        queryClient.invalidateQueries({ queryKey: ["companies"] }),
        queryClient.invalidateQueries({ queryKey: ["contacts"] }),
        queryClient.invalidateQueries({ queryKey: ["approvals"] }),
      ]);
      if (stats.newlyAdded > 0) {
        showToast(
          "New Leads Ingested",
          `Successfully added ${stats.newlyAdded} new verified ${stats.newlyAdded === 1 ? "lead" : "leads"} to your pipeline.`,
          "success"
        );
        addNotification({
          title: "Lead Sync Completed",
          message: `Ingested ${stats.newlyAdded} new verified leads across active market signals.`,
          type: "success",
        });
      } else {
        showToast(
          "Pipeline Up to Date",
          "All scanned market signals are already synced. Your candidate pipeline is fully up to date.",
          "success"
        );
        addNotification({
          title: "Pipeline Up to Date",
          message: "All scanned public hiring signals are already present in your active pipeline.",
          type: "success",
        });
      }
    } catch (err) {
      showToast(
        "Sync Failed",
        extractErrorMessage(err, "Lead sync service encountered an issue"),
        "delete"
      );
    } finally {
      setIsScraping(false);
    }
  };

  const handleExportBoth = async () => {
    setIsExporting(true);
    try {
      await downloadBothLeadsExport({
        search: search || undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        hiringType: typeFilter !== "All" ? typeFilter : undefined,
        minScore: scoreFilter !== "All" ? parseInt(scoreFilter, 10) : undefined,
      });
      showToast(
        "Export Complete",
        "Both CSV and Excel (.xlsx) workbooks downloaded successfully.",
        "success"
      );
    } catch (err) {
      showToast(
        "Export Failed",
        err instanceof Error ? err.message : "Failed to export leads",
        "delete"
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportLeads = async (format: "csv" | "xlsx") => {
    setIsExporting(true);
    try {
      await downloadLeadsExport(format, {
        search: search || undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        hiringType: typeFilter !== "All" ? typeFilter : undefined,
        minScore: scoreFilter !== "All" ? parseInt(scoreFilter, 10) : undefined,
      });
      showToast(
        "Export Complete",
        `Leads exported as ${format.toUpperCase()} successfully.`,
        "success"
      );
    } catch (err) {
      showToast(
        "Export Failed",
        err instanceof Error ? err.message : "Failed to export leads",
        "delete"
      );
    } finally {
      setIsExporting(false);
    }
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

      const matchesSource =
        source === "All Sources" ||
        (lead.source && lead.source.toLowerCase().includes(source.toLowerCase())) ||
        (source === "LinkedIn" && (!lead.source || lead.source.toLowerCase().includes("linkedin")));

      return matchesSearch && matchesSource && matchesStatus && matchesType && matchesScore;
    });
  }, [enrichedLeads, search, source, statusFilter, typeFilter, scoreFilter]);

  // Open meeting scheduler modal for lead
  const handleMarkMeetingBooked = (lead: EnrichedLead) => {
    if (!canManageLeads) {
      showToast("Not allowed", "Your role can't schedule meetings.", "delete");
      return;
    }
    setSchedulingLead(lead);
  };

  const handleConfirmSchedule = async (
    date: string,
    time: string,
    link: string,
    notes: string
  ) => {
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
      addNotification({
        title: "Meeting Scheduled",
        message: `Meeting with ${schedulingLead.company} booked for ${date} at ${time}.`,
        type: "meeting",
      });
      showToast("Meeting Scheduled", `Meeting with ${schedulingLead.company} booked successfully.`, "meeting");
    } catch (err) {
      showToast("Scheduling Failed", err instanceof Error ? err.message : "Could not schedule meeting", "delete");
    } finally {
      setSchedulingLead(null);
    }
  };

  const handleAddLeadClick = () => {
    if (!canManageLeads) {
      showToast("Not allowed", "Your role cannot create leads.", "delete");
      return;
    }
    setAddModalOpen(true);
  };

  const handleCreateLead = async (formData: NewLeadFormData) => {
    try {
      await createLead({
        companyName: formData.companyName,
        companyDomain: formData.companyDomain,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactTitle: formData.contactTitle,
        roleTitle: formData.roleTitle,
        hiringType: formData.hiringType,
        stage: formData.stage,
        fitScore: formData.fitScore,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["leads"] }),
        queryClient.invalidateQueries({ queryKey: ["companies"] }),
        queryClient.invalidateQueries({ queryKey: ["contacts"] }),
      ]);

      addNotification({
        title: "Lead Created",
        message: `Lead for ${formData.companyName} added to pipeline.`,
        type: "success",
      });

      showToast("Lead Created", `${formData.companyName} has been added successfully.`, "success");
    } catch (err) {
      showToast("Creation failed", err instanceof Error ? err.message : "Could not create lead", "delete");
      throw err;
    }
  };

  const handleDeleteLeadClick = async (lead: EnrichedLead) => {
    if (!canManageLeads) {
      showToast("Not allowed", "Your role cannot delete leads.", "delete");
      return;
    }

    try {
      await deleteLead(lead.id);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["leads"] }),
        queryClient.invalidateQueries({ queryKey: ["companies"] }),
        queryClient.invalidateQueries({ queryKey: ["contacts"] }),
      ]);
      addNotification({
        title: "Lead Deleted",
        message: `${lead.company} was removed from pipeline.`,
        type: "delete",
      });
      showToast("Lead Deleted", `${lead.company} has been deleted.`, "delete");
      if (selectedLead?.id === lead.id) {
        setSelectedLead(null);
      }
    } catch (err) {
      showToast("Delete failed", err instanceof Error ? err.message : "Could not delete lead", "delete");
    }
  };

  const handleEditLeadClick = (lead: EnrichedLead) => {
    if (!canManageLeads) {
      showToast("Not allowed", "Your role cannot edit leads.", "delete");
      return;
    }
    setEditingLead(lead);
  };

  const handleUpdateLead = async (leadId: string, data: { stage: LeadStage; fitScore: number }) => {
    try {
      await updateLead(leadId, { stage: data.stage, fitScore: data.fitScore });
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      addNotification({
        title: "Lead Updated",
        message: `Lead details updated successfully.`,
        type: "edit",
      });
      showToast("Lead Updated", "Lead details saved successfully.", "edit");
    } catch (err) {
      showToast("Update failed", err instanceof Error ? err.message : "Could not update lead", "delete");
      throw err;
    }
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
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Lead Management</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Manage recruitment leads and outreach campaigns.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sync Live Leads Trigger */}
            <button
              onClick={handleDeepScrape}
              disabled={isScraping}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-50 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-200 dark:hover:bg-slate-800"
              title="Sync live hiring signals from public job boards"
            >
              <RefreshCw size={14} className={isScraping ? "animate-spin text-violet-600" : "text-violet-600"} />
              <span>{isScraping ? "Syncing..." : "Sync Live Leads"}</span>
            </button>

            {/* Consolidated Export Dropdown */}
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setExportMenuOpen((prev) => !prev)}
                disabled={isExporting}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-50"
                title="Export leads to CSV or Excel"
              >
                <Download size={14} />
                <span>{isExporting ? "Exporting..." : "Export"}</span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${exportMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {exportMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl dark:border-slate-700 dark:bg-[#111827] z-30">
                  <button
                    onClick={() => {
                      setExportMenuOpen(false);
                      handleExportLeads("csv");
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <FileText size={14} className="text-violet-600" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      setExportMenuOpen(false);
                      handleExportLeads("xlsx");
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <FileSpreadsheet size={14} className="text-emerald-600" />
                    <span>Export Excel (.xlsx)</span>
                  </button>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                  <button
                    onClick={() => {
                      setExportMenuOpen(false);
                      handleExportBoth();
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-slate-800"
                  >
                    <Download size={14} className="text-violet-600" />
                    <span>Export Both (CSV + Excel)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
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

        <div className="grid grid-cols-12 gap-6 items-start">
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
                onExport={handleExportLeads}
              />
            )}
          </div>

          <div
            ref={detailsPanelRef}
            className="col-span-12 xl:col-span-4 sticky top-6 self-start max-h-[calc(100vh-6.5rem)] pb-12 overflow-y-auto pr-1 custom-scrollbar"
          >
            <LeadDetails selectedLead={selectedLead} onScheduleMeeting={handleMarkMeetingBooked} />
          </div>
        </div>
      </div>

      <AddLeadModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleCreateLead}
      />

      <EditLeadModal
        lead={editingLead}
        open={!!editingLead}
        onClose={() => setEditingLead(null)}
        onSubmit={handleUpdateLead}
      />

      <MeetingSchedulerModal
        open={!!schedulingLead}
        lead={schedulingLead}
        onClose={() => setSchedulingLead(null)}
        onSchedule={handleConfirmSchedule}
      />

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