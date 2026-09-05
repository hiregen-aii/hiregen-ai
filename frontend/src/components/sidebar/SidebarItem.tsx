import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  title: string;
  icon: LucideIcon;
  path: string;
  active: boolean;
  collapsed: boolean;
  onClick?: () => void;
}

const SidebarItem = ({
  title,
  icon: Icon,
  path,
  active,
  collapsed,
  onClick,
}: SidebarItemProps) => {
  return (
    <Link
      to={path}
      onClick={onClick}
      className={`mb-1 flex items-center rounded-2xl transition-all duration-300
      ${
        active
          ? "bg-gradient-to-r from-violet-600 via-fuchsia-500 to-purple-500 text-white shadow-lg"
          : "text-violet-200 hover:bg-white/10 hover:text-white"
      }
      ${collapsed ? "justify-center p-4" : "gap-4 px-5 py-4"}
      `}
    >
      <Icon
        size={22}
        className={`flex-shrink-0 ${
          active ? "text-white" : "text-violet-300"
        }`}
      />

      {!collapsed && (
        <span className="whitespace-nowrap text-[16px] font-medium">
          {title}
        </span>
      )}
    </Link>
  );
};

export default SidebarItem;