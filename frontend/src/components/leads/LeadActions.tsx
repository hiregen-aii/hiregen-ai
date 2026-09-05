import { Eye, Pencil, Trash2 } from "lucide-react";
import type { EnrichedLead } from "@/features/leads/hooks/useEnrichedLeads";

interface LeadActionsProps {
  lead: EnrichedLead;
  onView: (lead: EnrichedLead) => void;
  onEdit: (lead: EnrichedLead) => void;
  onDelete: (lead: EnrichedLead) => void;
}

const LeadActions = ({ lead, onView, onEdit, onDelete }: LeadActionsProps) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onView(lead);
        }}
        className="rounded-lg p-2 text-slate-600 transition hover:bg-violet-100 hover:text-violet-600 dark:text-slate-300 dark:hover:bg-violet-900/30"
        title="View Lead"
      >
        <Eye className="h-4 w-4" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit(lead);
        }}
        className="rounded-lg p-2 text-slate-600 transition hover:bg-blue-100 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-blue-900/30"
        title="Edit Lead"
      >
        <Pencil className="h-4 w-4" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(lead);
        }}
        className="rounded-lg p-2 text-slate-600 transition hover:bg-red-100 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-900/30"
        title="Delete Lead"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

export default LeadActions;