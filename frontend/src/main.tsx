import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router-dom";

import App from "./App";

import "./index.css";

import { ThemeProvider } from "@/components/theme-provider";
import { NotificationProvider } from "@/context/NotificationContext";
import { ProfileProvider } from "@/context/ProfileContext";
import { SettingsProvider } from "@/context/SettingsContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
    >
      <NotificationProvider>
        <ProfileProvider>
          <SettingsProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        </SettingsProvider>
        </ProfileProvider>
      </NotificationProvider>
    </ThemeProvider>
  </React.StrictMode>
);