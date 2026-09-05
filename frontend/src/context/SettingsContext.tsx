import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { defaultSettings } from "@/data/settings";
import type { SettingsState } from "@/types/settings";

interface SettingsContextType {
  settings: SettingsState;

  updateAppearance: (
    data: Partial<SettingsState["appearance"]>
  ) => void;

  updateNotifications: (
    data: Partial<SettingsState["notifications"]>
  ) => void;

  updateSecurity: (
    data: Partial<SettingsState["security"]>
  ) => void;

  updateAI: (
    data: Partial<SettingsState["ai"]>
  ) => void;

  restoreDefaults: () => void;
}

const SettingsContext = createContext<
  SettingsContextType | undefined
>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider = ({
  children,
}: SettingsProviderProps) => {

  const loadSettings = (): SettingsState => {

    const saved =
      localStorage.getItem(
        "hiregen-settings"
      );

    if (!saved) {

      return defaultSettings;

    }

    try {

      const parsed = JSON.parse(saved);

      return {

        appearance: {
          ...defaultSettings.appearance,
          ...parsed.appearance,
        },

        notifications: {
          ...defaultSettings.notifications,
          ...parsed.notifications,
        },

        security: {
          ...defaultSettings.security,
          ...parsed.security,
        },

        ai: {
          ...defaultSettings.ai,
          ...parsed.ai,
        },

        support: {
          ...defaultSettings.support,
          ...parsed.support,
        },

      };

    } catch {

      return defaultSettings;

    }

  };

  const [settings, setSettings] =
    useState<SettingsState>(
      loadSettings
    );

  useEffect(() => {

    localStorage.setItem(
      "hiregen-settings",
      JSON.stringify(settings)
    );

  }, [settings]);

  const updateAppearance = (
    data: Partial<
      SettingsState["appearance"]
    >
  ) => {

    setSettings((previous) => ({

      ...previous,

      appearance: {

        ...previous.appearance,

        ...data,

      },

    }));

  };

  const updateNotifications = (
    data: Partial<
      SettingsState["notifications"]
    >
  ) => {

    setSettings((previous) => ({

      ...previous,

      notifications: {

        ...previous.notifications,

        ...data,

      },

    }));

  };

    const updateSecurity = (
    data: Partial<
      SettingsState["security"]
    >
  ) => {

    setSettings((previous) => ({

      ...previous,

      security: {

        ...previous.security,

        ...data,

      },

    }));

  };

  const updateAI = (
    data: Partial<
      SettingsState["ai"]
    >
  ) => {

    setSettings((previous) => ({

      ...previous,

      ai: {

        ...previous.ai,

        ...data,

      },

    }));

  };

  const restoreDefaults = () => {

    setSettings(defaultSettings);

    localStorage.setItem(
      "hiregen-settings",
      JSON.stringify(defaultSettings)
    );

  };

  return (

    <SettingsContext.Provider
      value={{
        settings,
        updateAppearance,
        updateNotifications,
        updateSecurity,
        updateAI,
        restoreDefaults,
      }}
    >

      {children}

    </SettingsContext.Provider>

  );

};

export const useSettings = () => {

  const context =
    useContext(SettingsContext);

  if (!context) {

    throw new Error(
      "useSettings must be used inside SettingsProvider."
    );

  }

  return context;

};

export default SettingsContext;