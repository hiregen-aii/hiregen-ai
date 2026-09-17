import { useState, useRef, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Download,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  ChevronDown,
} from "lucide-react";

import { useNotifications } from "@/context/NotificationContext";
import { useCandidates } from "@/features/candidates/hooks/useCandidates";
import {
  createCandidate,
  updateCandidate,
  deleteCandidate,
  triggerCandidateSync,
  downloadCandidatesExport,
  downloadBothCandidatesExport,
  type CreateCandidatePayload,
  type UpdateCandidatePayload,
} from "@/services/candidates.service";
import type { Candidate, CandidateStatus } from "@/types/candidate";

import CandidateStats from "@/components/candidates/CandidateStats";
import CandidateSearchBar from "@/components/candidates/CandidateSearchBar";
import CandidatesTable from "@/components/candidates/CandidatesTable";
import CandidateDetails from "@/components/candidates/CandidateDetails";
import AddCandidateModal from "@/components/candidates/AddCandidateModal";
import EditCandidateModal from "@/components/candidates/EditCandidateModal";
import Toast from "@/components/common/Toast";

const CandidatesPage = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [experienceFilter, setExperienceFilter] = useState("All");
  const [scoreFilter, setScoreFilter] = useState("All");

  const { data: candidates = [], isLoading, isError, error } = useCandidates();

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [exportMenuOpen]);

  // Client-side filtering for immediate snappy responsiveness
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.full_name.toLowerCase().includes(q) ||
        c.headline.toLowerCase().includes(q) ||
        (c.current_company && c.current_company.toLowerCase().includes(q)) ||
        c.email.toLowerCase().includes(q) ||
        (c.skills && c.skills.some((s) => s.toLowerCase().includes(q)));

      const matchesLocation =
        locationFilter === "All Locations" ||
        c.location.toLowerCase().includes(locationFilter.toLowerCase());

      const matchesStatus =
        statusFilter === "All Statuses" || c.status === statusFilter;

      const matchesAvailability =
        availabilityFilter === "All" ||
        (c.notice_period && c.notice_period.toLowerCase().includes(availabilityFilter.toLowerCase()));

      const matchesExperience =
        experienceFilter === "All" ||
        (experienceFilter === "intern"
          ? (c.hiring_type === "INTERN" || c.experience_years <= 1)
          : experienceFilter === "fresher"
          ? (c.experience_years >= 1 && c.experience_years <= 2)
          : c.experience_years >= parseInt(experienceFilter, 10));

      const matchesScore =
        scoreFilter === "All" ||
        (scoreFilter === "80+" && c.fit_score >= 80) ||
        (scoreFilter === "85+" && c.fit_score >= 85) ||
        (scoreFilter === "90+" && c.fit_score >= 90);

      return (
        matchesSearch &&
        matchesLocation &&
        matchesStatus &&
        matchesAvailability &&
        matchesExperience &&
        matchesScore
      );
    });
  }, [candidates, search, locationFilter, statusFilter, availabilityFilter, experienceFilter, scoreFilter]);

  // Sync Live Talent Trigger
  const handleSyncCandidates = async () => {
    setIsSyncing(true);
    try {
      const res = await triggerCandidateSync();
      await queryClient.invalidateQueries({ queryKey: ["candidates"] });
      await queryClient.invalidateQueries({ queryKey: ["candidate-stats"] });

      showToast(
        "Talent Ingestion Complete",
        `Ingested ${res.newlyAdded} new verified candidates across Indian developer networks.`,
        "success"
      );
      addNotification({
        title: "Candidate Talent Ingested",
        message: `Added ${res.newlyAdded} active candidate profiles to your talent pool.`,
        type: "success",
      });
    } catch (err) {
      showToast(
        "Sync Failed",
        err instanceof Error ? err.message : "Candidate sync encountered an issue.",
        "delete"
      );
    } finally {
      setIsSyncing(false);
    }
  };

  // Dedicated Candidate Export (CSV or XLSX)
  const handleExport = async (format: "csv" | "xlsx") => {
    setIsExporting(true);
    try {
      await downloadCandidatesExport(format, {
        search: search || undefined,
        location: locationFilter !== "All Locations" ? locationFilter : undefined,
        status: statusFilter !== "All Statuses" ? statusFilter : undefined,
        availability: availabilityFilter !== "All" ? availabilityFilter : undefined,
        experience: experienceFilter !== "All" ? experienceFilter : undefined,
        minScore: scoreFilter !== "All" ? scoreFilter : undefined,
      });
      showToast(
        "Export Complete",
        `Candidate pool exported as ${format.toUpperCase()} successfully.`,
        "success"
      );
    } catch (err) {
      showToast("Export Failed", err instanceof Error ? err.message : "Failed to export talent", "delete");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportBoth = async () => {
    setIsExporting(true);
    try {
      await downloadBothCandidatesExport({
        search: search || undefined,
        location: locationFilter !== "All Locations" ? locationFilter : undefined,
        status: statusFilter !== "All Statuses" ? statusFilter : undefined,
      });
      showToast("Export Complete", "Both CSV and Excel (.xlsx) workbooks downloaded successfully.", "success");
    } catch (err) {
      showToast("Export Failed", err instanceof Error ? err.message : "Export failed", "delete");
    } finally {
      setIsExporting(false);
    }
  };

  // Create Candidate
  const handleCreateCandidate = async (formData: CreateCandidatePayload) => {
    try {
      await createCandidate(formData);
      await queryClient.invalidateQueries({ queryKey: ["candidates"] });
      await queryClient.invalidateQueries({ queryKey: ["candidate-stats"] });
      showToast("Candidate Added", `${formData.fullName} added to candidate pool.`, "success");
    } catch (err) {
      showToast("Error", err instanceof Error ? err.message : "Failed to add candidate", "delete");
      throw err;
    }
  };

  // Update Candidate
  const handleUpdateCandidate = async (id: string, updateData: UpdateCandidatePayload) => {
    try {
      const updated = await updateCandidate(id, updateData);
      await queryClient.invalidateQueries({ queryKey: ["candidates"] });
      if (selectedCandidate?.id === id) {
        setSelectedCandidate(updated);
      }
      showToast("Candidate Updated", "Profile changes saved successfully.", "edit");
    } catch (err) {
      showToast("Error", err instanceof Error ? err.message : "Failed to update candidate", "delete");
      throw err;
    }
  };

  // Delete Candidate
  const handleDeleteCandidate = async (cand: Candidate) => {
    if (!window.confirm(`Are you sure you want to remove ${cand.full_name} from the candidate pool?`)) {
      return;
    }

    try {
      await deleteCandidate(cand.id);
      await queryClient.invalidateQueries({ queryKey: ["candidates"] });
      if (selectedCandidate?.id === cand.id) {
        setSelectedCandidate(null);
      }
      showToast("Candidate Removed", `${cand.full_name} removed from pool.`, "delete");
    } catch (err) {
      showToast("Error", err instanceof Error ? err.message : "Failed to delete candidate", "delete");
    }
  };

  // Quick Status Change from Drawer
  const handleStatusChange = async (id: string, newStatus: CandidateStatus) => {
    await handleUpdateCandidate(id, { status: newStatus });
  };

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
        Could not load candidates: {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Page Header & Actions */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Candidate Pool</h1>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                India Tech Talent
              </span>
            </div>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Discover, filter, and manage pre-screened Indian software engineers and active job seekers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sync Live Candidates Trigger */}
            <button
              onClick={handleSyncCandidates}
              disabled={isSyncing}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-200 dark:hover:bg-slate-800"
              title="Scan Indian developer communities & open job seeker boards"
            >
              <RefreshCw size={14} className={isSyncing ? "animate-spin text-emerald-600" : "text-emerald-600"} />
              <span>{isSyncing ? "Scanning Talent..." : "Sync Live Candidates"}</span>
            </button>

            {/* Dedicated Candidate Export Dropdown */}
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setExportMenuOpen((prev) => !prev)}
                disabled={isExporting}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                title="Export candidate pool to CSV or Excel"
              >
                <Download size={14} />
                <span>{isExporting ? "Exporting..." : "Export Talent"}</span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${exportMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {exportMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl dark:border-slate-700 dark:bg-[#111827] z-30">
                  <button
                    onClick={() => {
                      setExportMenuOpen(false);
                      handleExport("csv");
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <FileText size={14} className="text-violet-600" />
                    <span>Export CSV (Candidates)</span>
                  </button>
                  <button
                    onClick={() => {
                      setExportMenuOpen(false);
                      handleExport("xlsx");
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
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-slate-800"
                  >
                    <Download size={14} className="text-emerald-600" />
                    <span>Export Both (CSV + Excel)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats KPIs */}
        <CandidateStats candidates={candidates} />

        {/* Search & Filter Bar */}
        <CandidateSearchBar
          search={search}
          setSearch={setSearch}
          locationFilter={locationFilter}
          setLocationFilter={setLocationFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          availabilityFilter={availabilityFilter}
          setAvailabilityFilter={setAvailabilityFilter}
          experienceFilter={experienceFilter}
          setExperienceFilter={setExperienceFilter}
          scoreFilter={scoreFilter}
          setScoreFilter={setScoreFilter}
          onAddCandidate={() => setAddModalOpen(true)}
        />

        {/* Main Grid: Table & Dossier Drawer */}
        <div className="grid grid-cols-12 gap-6 items-start">
          <div className="col-span-12 xl:col-span-8">
            {isLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-700 dark:bg-[#111827] dark:text-slate-400">
                Loading candidate pool...
              </div>
            ) : (
              <CandidatesTable
                candidates={filteredCandidates}
                selectedCandidate={selectedCandidate}
                setSelectedCandidate={setSelectedCandidate}
                onEditCandidate={(c) => setEditingCandidate(c)}
                onDeleteCandidate={handleDeleteCandidate}
                onExport={handleExport}
              />
            )}
          </div>

          <div className="col-span-12 xl:col-span-4 sticky top-6 self-start max-h-[calc(100vh-6.5rem)] pb-12 overflow-y-auto pr-1 custom-scrollbar">
            <CandidateDetails
              selectedCandidate={selectedCandidate}
              onStatusChange={handleStatusChange}
              onScheduleInterview={(c) => {
                showToast("Interview Scheduler", `Scheduling screen with ${c.full_name}...`, "meeting");
              }}
            />
          </div>
        </div>
      </div>

      {/* Add Candidate Modal */}
      <AddCandidateModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleCreateCandidate}
      />

      {/* Edit Candidate Modal */}
      <EditCandidateModal
        candidate={editingCandidate}
        open={!!editingCandidate}
        onClose={() => setEditingCandidate(null)}
        onSubmit={handleUpdateCandidate}
      />

      {/* Toast Feedback */}
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

export default CandidatesPage;
