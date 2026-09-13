import { useState, useRef, useEffect } from "react";
import { Building2, Download, ChevronDown, FileSpreadsheet, FileText } from "lucide-react";
import LeadActions from "./LeadActions";
import type { EnrichedLead } from "@/features/leads/hooks/useEnrichedLeads";

interface LeadsTableProps {
  leads: EnrichedLead[];
  selectedLead: EnrichedLead | null;
  setSelectedLead: (lead: EnrichedLead) => void;
  onEditLead: (lead: EnrichedLead) => void;
  onDeleteLead: (lead: EnrichedLead) => void;
  onExport?: (format: "csv" | "xlsx") => void;
}

const statusColor = (status: string) => {
  switch (status) {
    case "Contacted":
      return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300";
    case "Replied":
      return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300";
    case "Meeting":
      return "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300";
    case "Draft Ready":
    case "Approved":
      return "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300";
    case "Client Won":
      return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300";
    case "Lost":
      return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

const LeadsTable = ({
  leads,
  selectedLead,
  setSelectedLead,
  onEditLead,
  onDeleteLead,
  onExport,
}: LeadsTableProps) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#111827]">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Leads</h2>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-600 dark:bg-violet-900/30 dark:text-violet-300">
            {leads.length} Records
          </span>
        </div>

        {onExport && (
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-700"
              title="Export leads to CSV or Excel"
            >
              <Download size={14} />
              <span>Export</span>
              <ChevronDown size={12} />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-[#111827]">
                <button
                  onClick={() => {
                    onExport("csv");
                    setShowExportMenu(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <FileText size={15} className="text-violet-600" />
                  <div>
                    <p className="font-semibold">Export CSV</p>
                    <p className="text-[10px] text-slate-400">RFC 4180 standard</p>
                  </div>
                </button>
                <div className="border-t border-slate-100 dark:border-slate-800" />
                <button
                  onClick={() => {
                    onExport("xlsx");
                    setShowExportMenu(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <FileSpreadsheet size={15} className="text-emerald-600" />
                  <div>
                    <p className="font-semibold">Export Excel (.xlsx)</p>
                    <p className="text-[10px] text-slate-400">Styled workbook</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">Company</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Contact</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Score</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="py-14 text-center text-slate-500 dark:text-slate-400">
                  No leads found.
                </td>
              </tr>
            )}

            {leads.map((lead) => {
              const selected = selectedLead?.id === lead.id;

              return (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={`cursor-pointer border-t border-slate-100 transition-all dark:border-slate-700 ${
                    selected
                      ? "bg-violet-50 dark:bg-violet-900/20"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-violet-100 p-2 dark:bg-violet-900/30">
                        <Building2 className="h-5 w-5 text-violet-600" />
                      </div>
                      <span className="font-semibold dark:text-white">{lead.company}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium dark:text-white">{lead.contact}</p>
                      <p className="text-sm text-slate-500">{lead.designation}</p>
                    </div>
                  </td>

                  <td className="px-6 py-4">{lead.type}</td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600"
                          style={{ width: `${lead.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold">{lead.score}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${statusColor(
                        lead.status
                      )}`}
                    >
                      {lead.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <LeadActions
                      lead={lead}
                      onView={setSelectedLead}
                      onEdit={onEditLead}
                      onDelete={onDeleteLead}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadsTable;