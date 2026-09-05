import { useEffect, useRef, useState } from "react";
import { Upload, X, FileText } from "lucide-react";

import type { CompanyDocument } from "@/types/company";

interface UploadDocumentModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (document: CompanyDocument) => void;
}

const UploadDocumentModal = ({
  open,
  onClose,
  onUpload,
}: UploadDocumentModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) {
      setFile(null);
    }
  }, [open]);

  if (!open) return null;

  const handleUpload = () => {
    if (!file) {
      alert("Please select a file.");
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();

    const document: CompanyDocument = {
      id: Date.now(),
      name: file.name,
      type:
        extension === "doc"
          ? "doc"
          : extension === "docx"
          ? "docx"
          : "pdf",
      uploadedAt: new Date().toLocaleDateString(),
    };

    onUpload(document);

    setFile(null);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-[#111827]">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-700">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/30">
              <Upload
                size={24}
                className="text-violet-600"
              />
            </div>

            <div>

              <h2 className="text-xl font-bold dark:text-white">
                Upload Document
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Upload PDF, DOC or DOCX files.
              </p>

            </div>

          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={22} />
          </button>

        </div>

        {/* Body */}

        <div className="space-y-6 p-6">

          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-2xl border-2 border-dashed border-violet-300 p-10 text-center transition hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/10"
          >

            <Upload
              size={42}
              className="mx-auto text-violet-600"
            />

            <h3 className="mt-4 text-lg font-semibold dark:text-white">
              Click to Select File
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Supported formats: PDF, DOC, DOCX
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              hidden
              onChange={(e) => {
                if (e.target.files?.length) {
                  setFile(e.target.files[0]);
                }
              }}
            />

          </div>

          {file && (
            <div className="flex items-center gap-3 rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">

              <FileText
                size={24}
                className="text-violet-600"
              />

              <div className="flex-1">

                <p className="font-semibold dark:text-white">
                  {file.name}
                </p>

                <p className="text-sm text-slate-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>

              </div>

            </div>
          )}

        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-5 dark:border-slate-700">

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-2.5 font-medium transition hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            onClick={handleUpload}
            className="rounded-xl bg-violet-600 px-5 py-2.5 font-semibold text-white transition hover:bg-violet-700"
          >
            Upload
          </button>

        </div>

      </div>

    </div>
  );
};

export default UploadDocumentModal;