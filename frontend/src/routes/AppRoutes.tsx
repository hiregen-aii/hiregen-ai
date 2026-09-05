import { Routes, Route } from "react-router-dom";

import DashboardLayout from "@/layouts/DashboardLayout";
import AuthLayout from "@/layouts/AuthLayout";
import ProtectedRoute from "@/routes/ProtectedRoute";

import LoginPage from "@/features/authentication/pages/LoginPage";
import ForgotPassword from "@/features/authentication/pages/ForgotPassword";
import ResetPassword from "@/features/authentication/pages/ResetPassword";

import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import LeadsPage from "@/features/leads/pages/LeadsPage";
import ApprovalPage from "@/features/approval/pages/ApprovalPage";
import CompanyPage from "@/features/company/pages/CompanyPage";
import CampaignsPage from "@/features/campaigns/pages/CampaignsPage";
import AnalyticsPage from "@/features/analytics/pages/AnalyticsPage";
import AdminPage from "@/features/administration/pages/AdminPage";
import ProfilePage from "@/features/profile/pages/ProfilePage";
import NotificationsPage from "@/features/notifications/pages/NotificationsPage";
import SettingsPage from "@/features/settings/pages/SettingsPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Authentication Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Dashboard Routes — every route below requires a valid session */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/approval" element={<ApprovalPage />} />
          <Route path="/company" element={<CompanyPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/administration" element={<AdminPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;