import type { SettingsState } from "@/types/settings";

export const defaultSettings: SettingsState = {
  appearance: {
    theme: "light",
  },

  notifications: {
    emailNotifications: true,
    interviewReminders: true,
    approvalNotifications: true,
    campaignUpdates: true,
    desktopNotifications: false,
  },

  security: {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  },

  ai: {
    resumeScreening: true,
    candidateRanking: true,
    emailSuggestions: true,
    matchScore: 75,
    preferredModel: "GPT-4",
  },

  support: {
    email: "support@hiregen.ai",
    phone: "+91 98765 43210",
    workingHours: "Monday - Friday | 9:00 AM - 6:00 PM",
  },
};