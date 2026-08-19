import { useState } from "react";

import { useNotifications } from "@/context/NotificationContext";

import CompanyStats from "@/components/company/CompanyStats";
import CompanyInfoCard from "@/components/company/CompanyInfoCard";
import CompanyDocuments from "@/components/company/CompanyDocuments";
import QuickActions from "@/components/company/QuickActions";
import HiringProgress from "@/components/company/HiringProgress";

import EditCompanyModal from "@/components/company/EditCompanyModal";
import UploadDocumentModal from "@/components/company/UploadDocumentModal";
import CallModal from "@/components/company/CallModal";
import ScheduleMeetingModal from "@/components/company/ScheduleMeetingModal";
import Toast from "@/components/common/Toast";

import {
  companyData,
  companyDocuments,
} from "@/data/company";

import type {
  Company,
  CompanyDocument,
  MeetingData,
} from "@/types/company";

const CompanyPage = () => {
  const { addNotification } = useNotifications();

  /* ---------------- Company State ---------------- */

  const [company, setCompany] =
    useState<Company>(companyData);

  const [documents, setDocuments] =
    useState<CompanyDocument[]>(companyDocuments);

  /* ---------------- Modal States ---------------- */

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [showUploadModal, setShowUploadModal] =
    useState(false);

  const [showCallModal, setShowCallModal] =
    useState(false);

  const [showMeetingModal, setShowMeetingModal] =
    useState(false);

  /* ---------------- Toast ---------------- */

  const [toastOpen, setToastOpen] =
    useState(false);

  const [toastTitle, setToastTitle] =
    useState("");

  const [toastMessage, setToastMessage] =
    useState("");

  const [toastType, setToastType] =
    useState<
      "success" | "edit" | "delete" | "meeting"
    >("success");

  const showToast = (
    title: string,
    message: string,
    type:
      | "success"
      | "edit"
      | "delete"
      | "meeting"
  ) => {
    setToastTitle(title);
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

    /* ---------------- Save Company ---------------- */

  const handleSaveCompany = (updatedCompany: Company) => {
    setCompany(updatedCompany);

    addNotification({
      title: "Company Updated",
      message: `${updatedCompany.name} profile has been updated.`,
      type: "edit",
    });

    showToast(
      "Company Updated",
      "Company profile updated successfully.",
      "edit"
    );
  };

  /* ---------------- Upload Document ---------------- */

  const handleUploadDocument = (
    document: CompanyDocument
  ) => {
    setDocuments((prev) => [...prev, document]);

    setCompany((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        documents: prev.stats.documents + 1,
      },
    }));

    addNotification({
      title: "Document Uploaded",
      message: `${document.name} uploaded successfully.`,
      type: "success",
    });

    showToast(
      "Upload Successful",
      `${document.name} uploaded successfully.`,
      "success"
    );
  };

  /* ---------------- Delete Document ---------------- */

  const handleDeleteDocument = (id: number) => {
    const document = documents.find((doc) => doc.id === id);

    if (!document) return;

    setDocuments((prev) =>
      prev.filter((doc) => doc.id !== id)
    );

    setCompany((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        documents: Math.max(
          0,
          prev.stats.documents - 1
        ),
      },
    }));

    addNotification({
      title: "Document Deleted",
      message: `${document.name} removed.`,
      type: "delete",
    });

    showToast(
      "Document Deleted",
      `${document.name} deleted successfully.`,
      "delete"
    );
  };

  /* ---------------- Send Email ---------------- */

  const handleSendEmail = () => {
  const subject = encodeURIComponent(
    `Business Proposal - ${company.name}`
  );

  const body = encodeURIComponent(`Dear ${company.ceo},

We hope you're doing well.

We would like to discuss potential collaboration opportunities with ${company.name}.

Looking forward to hearing from you.

Best Regards,
HireGen AI Team`);

  window.location.href = `mailto:${company.email}?subject=${subject}&body=${body}`;

  addNotification({
    title: "Email Client Opened",
    message: `Opening email client for ${company.name}.`,
    type: "success",
  });

  showToast(
    "Email",
    "Opening your default email application.",
    "success"
  );
};

  /* ---------------- Call ---------------- */

  const handleCall = () => {
    addNotification({
      title: "Phone Call",
      message: `Calling ${company.name}.`,
      type: "meeting",
    });

    showToast(
      "Calling",
      `Calling ${company.phone}`,
      "meeting"
    );
  };

  /* ---------------- Meeting ---------------- */

  const handleMeeting = (
    meeting: MeetingData
  ) => {
    console.log(meeting);

    addNotification({
      title: "Meeting Scheduled",
      message: `Meeting scheduled with ${company.name}.`,
      type: "meeting",
    });

    showToast(
      "Meeting Scheduled",
      "Meeting scheduled successfully.",
      "meeting"
    );

    setShowMeetingModal(false);
  };

  /* ---------------- LinkedIn ---------------- */

  const handleLinkedIn = () => {
    window.open(
      company.linkedin,
      "_blank",
      "noopener,noreferrer"
    );

    addNotification({
      title: "LinkedIn Opened",
      message: `${company.name} LinkedIn profile opened.`,
      type: "success",
    });
  };

  return (
  <div className="space-y-6">

    <div>

  <h1 className="text-3xl font-bold text-slate-900 dark:text-white">

    Company Profile

  </h1>

  <p className="mt-1 text-slate-500 dark:text-slate-400">

    Manage your company information, branding, contact details, locations, and organizational profile.

  </p>

</div>

    {/* Hero Card */}

    <div className="rounded-3xl bg-gradient-to-r from-violet-700 via-purple-700 to-fuchsia-700 p-8 text-white shadow-xl">

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-5">

          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 backdrop-blur">

            <span className="text-4xl font-bold">
              {company.name.charAt(0)}
            </span>

          </div>

          <div>

            <h1 className="text-4xl font-bold">
              {company.name}
            </h1>

            <p className="mt-2 max-w-3xl text-violet-100">
              {company.tagline}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">

              <span className="rounded-full bg-white/20 px-4 py-1 text-sm font-medium">
                {company.industry}
              </span>

              <span className="rounded-full bg-white/20 px-4 py-1 text-sm font-medium">
                {company.location}
              </span>

              <span
                className={`rounded-full px-4 py-1 text-sm font-semibold ${
                  company.status === "Active"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              >
                {company.status}
              </span>

            </div>

          </div>

        </div>

        <button
          onClick={() => setShowEditModal(true)}
          className="rounded-2xl bg-white px-6 py-3 font-semibold text-violet-700 transition hover:scale-105"
        >
          Edit Profile
        </button>

      </div>

    </div>

    {/* Statistics */}

    <CompanyStats
      company={company}
    />

        {/* Main Content */}

    <div className="grid gap-6 xl:grid-cols-3">

      {/* Left Section */}

      <div className="space-y-6 xl:col-span-2">

        <CompanyInfoCard
          company={company}
        />

        <CompanyDocuments
          documents={documents}
          onUpload={() => setShowUploadModal(true)}
          onDelete={handleDeleteDocument}
        />

      </div>

      {/* Right Section */}

      <div className="space-y-6">

        <QuickActions
          onEmail={handleSendEmail}
          onCall={() => setShowCallModal(true)}
          onLinkedIn={handleLinkedIn}
          onMeeting={() => setShowMeetingModal(true)}
        />

        <HiringProgress
          progress={company.hiringProgress}
        />

      </div>

    </div>

        {/* Edit Company */}

    <EditCompanyModal
      open={showEditModal}
      company={company}
      onClose={() => setShowEditModal(false)}
      onSave={handleSaveCompany}
    />

    {/* Upload Document */}

    <UploadDocumentModal
      open={showUploadModal}
      onClose={() => setShowUploadModal(false)}
      onUpload={handleUploadDocument}
    />

    {/* Call */}

    <CallModal
      open={showCallModal}
      company={company}
      onClose={() => setShowCallModal(false)}
      onCall={handleCall}
    />

    {/* Schedule Meeting */}

    <ScheduleMeetingModal
  open={showMeetingModal}
  company={company}
  onClose={() => setShowMeetingModal(false)}
  onSchedule={handleMeeting}
/>

    {/* Toast */}

    <Toast
      open={toastOpen}
      title={toastTitle}
      message={toastMessage}
      type={toastType}
      onClose={() => setToastOpen(false)}
    />

  </div>
);
};
export default CompanyPage;
