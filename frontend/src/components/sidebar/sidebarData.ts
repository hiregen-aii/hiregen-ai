import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Building2,
  Megaphone,
  BarChart3,
  ShieldCheck,
  Bell,
  UserCircle,
  Settings,
} from "lucide-react";

export const sidebarItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    title: "Lead Management",
    icon: Users,
    path: "/leads",
  },
  {
    title: "Approval Queue",
    icon: ClipboardCheck,
    path: "/approval",
  },
  {
    title: "Company Profile",
    icon: Building2,
    path: "/company",
  },
  {
    title: "Campaign Management",
    icon: Megaphone,
    path: "/campaigns",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    path: "/analytics",
  },
  {
    title: "Administration",
    icon: ShieldCheck,
    path: "/administration",
  },
  {
    title: "Notifications",
    icon: Bell,
    path: "/notifications",
  },
  {
    title: "Profile",
    icon: UserCircle,
    path: "/profile",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
  },
];