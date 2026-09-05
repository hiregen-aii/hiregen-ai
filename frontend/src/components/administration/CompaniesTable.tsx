import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  Search,
  Building2,
} from "lucide-react";

import type {
  Company,
} from "@/types/administration";

interface CompaniesTableProps {
  companies: Company[];

  searchTerm: string;

  onSearchChange: (
    value: string
  ) => void;

  onAddCompany: () => void;

  onView: (
    company: Company
  ) => void;

  onEdit: (
    company: Company
  ) => void;

  onDelete: (
    company: Company
  ) => void;
}

const CompaniesTable = ({
  companies,
  searchTerm,
  onSearchChange,
  onAddCompany,
  onView,
  onEdit,
  onDelete,
}: CompaniesTableProps) => {

  const filteredCompanies =
    companies.filter((company) => {

      const keyword =
        searchTerm.toLowerCase();

      return (
        company.name
          .toLowerCase()
          .includes(keyword) ||

        company.email
          .toLowerCase()
          .includes(keyword) ||

        company.industry
          .toLowerCase()
          .includes(keyword) ||

        company.location
          .toLowerCase()
          .includes(keyword)
      );

    });

  const getStatusClass = (
    status: Company["status"]
  ) => {

    switch (status) {

      case "Active":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";

      case "Waiting":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";

      default:
        return "bg-slate-100 text-slate-700";
    }

  };

  const getVerificationClass = (
    verification: Company["verification"]
  ) => {

    switch (verification) {

      case "Verified":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";

      case "Pending":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";

      default:
        return "bg-slate-100 text-slate-700";
    }

  };

  return (

    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#111827]">

              {/* Header */}

      <div className="flex flex-col gap-4 border-b border-slate-200 p-6 dark:border-slate-700 lg:flex-row lg:items-center lg:justify-between">

        <div className="relative w-full lg:max-w-md">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) =>
              onSearchChange(e.target.value)
            }
            placeholder="Search companies..."
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:ring-violet-900/30"
          />

        </div>

        <button
          onClick={onAddCompany}
          className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-medium text-white transition-all duration-300 hover:bg-violet-700 hover:shadow-lg"
        >

          <Plus size={18} />

          Add Company

        </button>

      </div>

      {/* Table */}

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">

            <tr>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                Company
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                Industry
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                Location
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                Verification
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                Status
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

                      {filteredCompanies.map((company) => (

            <tr
              key={company.id}
              className="border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
            >

              {/* Company */}

              <td className="px-6 py-5">

                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">

                    <Building2
                      size={22}
                      className="text-violet-600 dark:text-violet-300"
                    />

                  </div>

                  <div>

                    <p className="font-semibold text-slate-900 dark:text-white">
                      {company.name}
                    </p>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {company.email}
                    </p>

                  </div>

                </div>

              </td>

              {/* Industry */}

              <td className="px-6 py-5 text-sm text-slate-700 dark:text-slate-300">
                {company.industry}
              </td>

              {/* Location */}

              <td className="px-6 py-5 text-sm text-slate-700 dark:text-slate-300">
                {company.location}
              </td>

              {/* Verification */}

              <td className="px-6 py-5">

                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${getVerificationClass(
                    company.verification
                  )}`}
                >
                  {company.verification}
                </span>

              </td>

              {/* Status */}

              <td className="px-6 py-5">

                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusClass(
                    company.status
                  )}`}
                >
                  {company.status}
                </span>

              </td>

              {/* Actions */}

              <td className="px-6 py-5">

                <div className="flex items-center justify-center gap-2">

                  <button
                    onClick={() => onView(company)}
                    className="rounded-lg bg-blue-100 p-2 text-blue-600 transition hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
                    title="View"
                  >
                    <Eye size={16} />
                  </button>

                  <button
                    onClick={() => onEdit(company)}
                    className="rounded-lg bg-amber-100 p-2 text-amber-600 transition hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => onDelete(company)}
                    className="rounded-lg bg-red-100 p-2 text-red-600 transition hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>

              </td>

            </tr>

          ))}

                    {filteredCompanies.length === 0 && (

            <tr>

              <td
                colSpan={6}
                className="px-6 py-16 text-center"
              >

                <div className="flex flex-col items-center">

                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">

                    <Building2
                      size={32}
                      className="text-slate-400"
                    />

                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    No Companies Found
                  </h3>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Try changing your search or add a new company.
                  </p>

                </div>

              </td>

            </tr>

          )}

          </tbody>

        </table>

      </div>

          </div>

  );
};

export default CompaniesTable;