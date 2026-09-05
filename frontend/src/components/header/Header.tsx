import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";

import { useNotifications } from "@/context/NotificationContext";
import { useProfile } from "@/context/ProfileContext";
import { useAuthStore } from "@/store/auth-store";

import {
  Bell,
  Moon,
  Sun,
  User,
  LogOut,
  ChevronDown,
  Menu,
  Settings,
} from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header = ({
  onMenuClick,
}: HeaderProps) => {

  const { theme, setTheme } = useTheme();

  const navigate = useNavigate();

  const {
    unreadCount,
    markAllAsRead,
  } = useNotifications();

  const {
    profile,
  } = useProfile();

  const [open, setOpen] =
    useState(false);

  const menuRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {

    const handler = (
      event: MouseEvent
    ) => {

      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {

        setOpen(false);

      }

    };

    document.addEventListener(
      "mousedown",
      handler
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handler
      );

    };

  }, []);

  const handleLogout = () => {
    useAuthStore.getState().logout();
    localStorage.removeItem("token");
    localStorage.removeItem("hiregen_profile");
    localStorage.removeItem("hiregen_skills");
    localStorage.removeItem("hiregen_activities");
    setOpen(false);
    navigate("/login");
  };

  return (

    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm dark:border-slate-700 dark:bg-[#111827] md:px-6">

      {/* Left */}

      <div className="flex items-center gap-4">

        {/* Mobile Menu */}

        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
        >

          <Menu className="h-6 w-6 text-slate-700 dark:text-white" />

        </button>

        {/* Title */}

        <div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-4xl">

            HireGen AI

          </h1>

          <p className="mt-0.5 hidden text-base text-slate-500 dark:text-slate-400 md:block">

            AI Powered Recruitment Platform

          </p>

        </div>

      </div>

      {/* Right */}

      <div className="flex items-center gap-2 md:gap-4">

        {/* Theme */}

        <button
          onClick={() =>
            setTheme(
              theme === "dark"
                ? "light"
                : "dark"
            )
          }
          className="rounded-xl p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
        >

          {theme === "dark" ? (

            <Sun className="h-5 w-5 text-yellow-400" />

          ) : (

            <Moon className="h-5 w-5 text-slate-700 dark:text-slate-300" />

          )}

        </button>

        {/* Notifications */}

        <button
          onClick={() => {

            markAllAsRead();

            navigate("/notifications");

          }}
          className="relative rounded-xl p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
        >

          <Bell className="h-5 w-5 text-slate-700 dark:text-white" />

          {unreadCount > 0 && (

            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">

              {unreadCount}

            </span>

          )}

        </button>

        {/* Profile Dropdown */}

        <div
          className="relative"
          ref={menuRef}
        >

                    <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 rounded-xl px-2 py-1 transition hover:bg-slate-100 dark:hover:bg-slate-800 md:gap-3"
          >

            {/* Profile Image */}

            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-violet-100 dark:bg-violet-900">

              {profile.profileImage ? (

                <img
                  src={profile.profileImage}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />

              ) : (

                <span className="text-base font-bold text-violet-600 dark:text-violet-300">
                  {(profile?.name || "U").charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Profile Info */}
            <div className="hidden text-left md:block">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {profile?.name || "User"}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {profile?.designation || "Member"}
              </p>
            </div>

            <ChevronDown className="hidden h-4 w-4 text-slate-500 md:block" />

          </button>

          {/* Dropdown Menu */}

          {open && (

            <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-[#1E293B]">

              <button
                onClick={() => {

                  navigate("/profile");

                  setOpen(false);

                }}
                className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-slate-100 dark:hover:bg-slate-700"
              >

                <User className="h-5 w-5" />

                Profile
              </button>

              <button
                onClick={() => {
                  navigate("/settings");
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Settings className="h-5 w-5" />
                Settings
              </button>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-5 py-3 text-left text-red-500 transition hover:bg-red-50 dark:hover:bg-red-900/20"
              >

                <LogOut className="h-5 w-5" />

                Logout

              </button>

            </div>

          )}

        </div>

      </div>

    </header>

  );

};

export default Header;