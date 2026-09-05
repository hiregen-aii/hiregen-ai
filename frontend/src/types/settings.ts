export type ThemeMode =
  | "light"
  | "dark"
  | "system";

export type AIModel =
  | "GPT-4"
  | "Claude"
  | "Gemini";

export interface AppearanceSettings {
  theme: ThemeMode;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  interviewReminders: boolean;
  approvalNotifications: boolean;
  campaignUpdates: boolean;
  desktopNotifications: boolean;
}

export interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AISettings {
  resumeScreening: boolean;
  candidateRanking: boolean;
  emailSuggestions: boolean;
  matchScore: number;
  preferredModel: AIModel;
}

export interface SupportSettings {
  email: string;
  phone: string;
  workingHours: string;
}

export interface SettingsState {
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  ai: AISettings;
  support: SupportSettings;
}