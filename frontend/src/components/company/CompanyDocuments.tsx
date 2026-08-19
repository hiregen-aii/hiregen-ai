import {
  FileText,
  File,
  Trash2,
  Upload,
} from "lucide-react";

import type { CompanyDocument } from "@/types/company";

interface CompanyDocumentsProps {
  documents: CompanyDocument[];
  onUpload: () => void;
  onDelete: (id: number) => void;
}

const CompanyDocuments = ({
  documents,
  onUpload,
  onDelete,
}: CompanyDocumentsProps) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#111827]">

      {/* Header */}

      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-700">

        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Company Documents
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage uploaded company documents.
          </p>
        </div>

        <button
          onClick={onUpload}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 font-medium text-white transition hover:bg-violet-700"
        >
          <Upload size={18} />
          Upload
        </button>

      </div>

      {/* Documents */}

      <div className="divide-y divide-slate-200 dark:divide-slate-700">

        {documents.length === 0 ? (
          <div className="py-16 text-center">

            <FileText
              size={48}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 text-lg font-semibold text-slate-700 dark:text-white">
              No Documents
            </h3>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Upload your first company document.
            </p>

          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between px-6 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-800"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">

                  <File
                    size={22}
                    className="text-violet-600"
                  />

                </div>

                <div>

                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    {doc.name}
                  </h4>

                  <div className="mt-1 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">

                    <span className="uppercase">
                      {doc.type}
                    </span>

                    <span>•</span>

                    <span>
                      {doc.uploadedAt}
                    </span>

                  </div>

                </div>

              </div>

              <button
                onClick={() => onDelete(doc.id)}
                className="rounded-xl p-2 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 size={20} />
              </button>

            </div>
          ))
        )}

      </div>

    </div>
  );
};

export default CompanyDocuments;