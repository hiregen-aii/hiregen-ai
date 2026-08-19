import { Building2 } from "lucide-react";
import LeadActions from "./LeadActions";
import type { Lead } from "@/data/leads";

interface LeadsTableProps {
  leads: Lead[];

  selectedLead: Lead | null;

  setSelectedLead: (lead: Lead) => void;

  onEditLead: (lead: Lead) => void;

  onDeleteLead: (lead: Lead) => void;
}

const statusColor = (status: string) => {
  switch (status) {
    case "Contacted":
      return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300";

    case "Replied":
      return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300";

    case "Meeting":
      return "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300";

    case "Proposal Sent":
      return "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300";

    case "Client Won":
      return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300";

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
}: LeadsTableProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#111827]">

      {/* Header */}

      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">

        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Leads
        </h2>

        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-600 dark:bg-violet-900/30 dark:text-violet-300">
          {leads.length} Records
        </span>

      </div>

      {/* Table */}

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-slate-50 dark:bg-slate-800">

            <tr>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Company
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Contact
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Type
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Score
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Status
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>
            {leads.length === 0 && (
  <tr>
    <td
      colSpan={6}
      className="py-14 text-center text-slate-500 dark:text-slate-400"
    >
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
                  className={`cursor-pointer border-t border-slate-100 transition-all dark:border-slate-700

                  ${
                    selected
                      ? "bg-violet-50 dark:bg-violet-900/20"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >

                  {/* Company */}

                  <td className="px-6 py-4">

                    <div className="flex items-center gap-3">

                      <div className="rounded-xl bg-violet-100 p-2 dark:bg-violet-900/30">

                        <Building2 className="h-5 w-5 text-violet-600" />

                      </div>

                      <span className="font-semibold dark:text-white">
                        {lead.company}
                      </span>

                    </div>

                  </td>

                  {/* Contact */}

                  <td className="px-6 py-4">

                    <div>

                      <p className="font-medium dark:text-white">
                        {lead.contact}
                      </p>

                      <p className="text-sm text-slate-500">
                        {lead.designation}
                      </p>

                    </div>

                  </td>

                  {/* Type */}

                  <td className="px-6 py-4">
                    {lead.type}
                  </td>

                  {/* Score */}

                  <td className="px-6 py-4">

                    <div className="flex items-center gap-3">

                      <div className="h-2 w-24 rounded-full bg-slate-200 dark:bg-slate-700">

                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600"
                          style={{
                            width: `${lead.score}%`,
                          }}
                        />

                      </div>

                      <span className="text-sm font-semibold">
                        {lead.score}
                      </span>

                    </div>

                  </td>

                  {/* Status */}

                  <td className="px-6 py-4">

                    <span
  className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${statusColor(
    lead.status
  )}`}
>
  {lead.status}
</span>

                  </td>

                  {/* Eye */}

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