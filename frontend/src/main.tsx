import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

import App from "./App";

import "./index.css";

import { ThemeProvider } from "@/components/theme-provider";
import { NotificationProvider } from "@/context/NotificationContext";
import { ProfileProvider } from "@/context/ProfileContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { queryClient } from "@/lib/query-client";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
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
    </QueryClientProvider>
  </React.StrictMode>
);