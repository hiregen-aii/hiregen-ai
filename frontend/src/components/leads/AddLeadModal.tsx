import { useEffect, useState } from "react";
import { X } from "lucide-react";

import LeadForm from "./LeadForm";

import type { Lead } from "@/data/leads";

interface AddLeadModalProps {
  open: boolean;
  onClose: () => void;

  onAddLead: (lead: Lead) => void;

  editingLead?: Lead | null;

  isEditing?: boolean;
}

const emptyLead = {
  company: "",
  contact: "",
  designation: "",
  email: "",
  phone: "",
  website: "",
  source: "LinkedIn",
  type: "Internship",
  score: 80,
  status: "Contacted",
};

const AddLeadModal = ({
  open,
  onClose,
  onAddLead,
  editingLead,
  isEditing = false,
}: AddLeadModalProps) => {
  const [form, setForm] = useState(emptyLead);

  useEffect(() => {
    if (editingLead) {
      setForm({
        company: editingLead.company,
        contact: editingLead.contact,
        designation: editingLead.designation,
        email: editingLead.email,
        phone: editingLead.phone,
        website: editingLead.website,
        source: editingLead.source,
        type: editingLead.type,
        score: editingLead.score,
        status: editingLead.status,
      });
    } else {
      setForm(emptyLead);
    }
  }, [editingLead, open]);

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.name === "score"
          ? Number(e.target.value)
          : e.target.value,
    }));
  };

  const handleSubmit = () => {
    if (
      !form.company.trim() ||
      !form.contact.trim() ||
      !form.email.trim() ||
      !form.phone.trim()
    ) {
      alert("Please fill all required fields.");
      return;
    }

    onAddLead({
      id: editingLead?.id ?? Date.now(),
      ...form,
    });

    setForm(emptyLead);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl dark:bg-[#111827]">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-8 py-6 dark:border-slate-700">

          <div>

            <h2 className="text-2xl font-bold dark:text-white">
              {isEditing ? "Edit Lead" : "Add New Lead"}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {isEditing
                ? "Update company information."
                : "Enter company details."}
            </p>

          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>

        </div>

        {/* Body */}

        <div className="p-8">

          <LeadForm
            form={form}
            onChange={handleChange}
          />

        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3 border-t border-slate-200 px-8 py-6 dark:border-slate-700">

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-6 py-2.5 font-medium transition hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 font-semibold text-white transition hover:opacity-90"
          >
            {isEditing ? "Update Lead" : "Add Lead"}
          </button>

        </div>

      </div>

    </div>
  );
};

export default AddLeadModal;