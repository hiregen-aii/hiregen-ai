import { useLocation } from "react-router-dom";
import {
  ChevronLeft,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";

import { sidebarItems } from "./sidebarData";
import SidebarItem from "./SidebarItem";

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

const Sidebar = ({
  mobile = false,
  onClose,
}: SidebarProps) => {
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        ${
          mobile
            ? "fixed left-0 top-0 z-50 w-72 shadow-2xl"
            : "relative"
        }
        flex h-screen flex-col overflow-hidden
        bg-gradient-to-b
        from-[#26134d]
        to-[#34205d]
        text-white
        transition-all
        duration-300
        ${collapsed && !mobile ? "w-24" : "w-72"}
      `}
    >
      {/* Mobile Close Button */}

      {mobile && (
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-white/10"
          >
            <X size={22} />
          </button>
        </div>
      )}

      {/* Logo */}

      <div className="flex items-center gap-4 px-5 py-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#8B5CF6] via-[#A855F7] to-[#D946EF] shadow-[0_10px_30px_rgba(168,85,247,0.45)]">

          <Sparkles
            size={30}
            strokeWidth={2.3}
            className="text-white"
          />

        </div>

        {!collapsed && (
          <div>

            <h2 className="whitespace-nowrap text-[22px] font-bold leading-none">
              HireGen AI
            </h2>

            <p className="mt-1 text-sm text-violet-200">
              AI Outreach Platform
            </p>

          </div>
        )}
      </div>

            {/* Menu */}

      <nav className="mt-1 flex-1 overflow-y-auto px-4 pb-6">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.path}
            title={item.title}
            icon={item.icon}
            path={item.path}
            active={location.pathname === item.path}
            collapsed={collapsed}
            onClick={() => {
              if (mobile) {
                onClose?.();
              }
            }}
          />
        ))}
      </nav>

      {/* Collapse Button (Desktop Only) */}

      {!mobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-5 top-28 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-xl transition hover:scale-105"
        >
          <ChevronLeft
            className={`transition-transform duration-300 ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      )}

      {/* Footer */}

      {!collapsed && !mobile && (
        <div className="border-t border-white/10 px-6 py-5 text-xs text-violet-300">
          © 2026 HireGen AI
        </div>
      )}
    </aside>
  );
};

export default Sidebar;