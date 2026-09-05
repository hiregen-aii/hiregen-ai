import { Outlet } from "react-router-dom";
import { useState } from "react";

import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/header/Header";

const DashboardLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FC] dark:bg-[#020617]">

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${
          mobileSidebarOpen ? "block" : "hidden"
        }`}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setMobileSidebarOpen(false)}
        />

        {/* Sidebar */}
        <div className="relative z-10 h-full">
          <Sidebar
            mobile
            onClose={() => setMobileSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Main Section */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Header */}
        <Header
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default DashboardLayout;