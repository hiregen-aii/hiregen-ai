import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth-store";

export interface NotificationItem {
  id: string | number;
  title: string;
  message: string;
  type: "success" | "edit" | "delete" | "meeting";
  createdAt: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (
    notification: Omit<
      NotificationItem,
      "id" | "createdAt" | "read"
    >
  ) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string | number) => void;
  clearNotifications: () => void;
}

const NotificationContext =
  createContext<NotificationContextType | null>(
    null
  );

const mapBackendType = (type: string): "success" | "edit" | "delete" | "meeting" => {
  switch (type) {
    case "MEETING_BOOKED":
      return "meeting";
    case "APPROVAL_PENDING":
      return "edit";
    case "LEAD_STAGE_CHANGED":
    case "APPROVAL_DECIDED":
      return "success";
    default:
      return "success";
  }
};

export const NotificationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [notifications, setNotifications] = useState<
    NotificationItem[]
  >([]);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      api
        .get("/notifications")
        .then((res) => {
          if (res.data?.success && Array.isArray(res.data.data)) {
            const items: NotificationItem[] = res.data.data.map((n: any) => ({
              id: n.id,
              title: n.title,
              message: n.message,
              type: mapBackendType(n.type),
              createdAt: new Date(n.created_at),
              read: Boolean(n.is_read),
            }));
            setNotifications(items);
          }
        })
        .catch(() => {});
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated]);

  const addNotification = (
    notification: Omit<
      NotificationItem,
      "id" | "createdAt" | "read"
    >
  ) => {
    setNotifications((prev) => [
      {
        id: Date.now(),
        createdAt: new Date(),
        read: false,
        ...notification,
      },
      ...prev,
    ]);
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        read: true,
      }))
    );
    if (isAuthenticated) {
      api.patch("/notifications/read-all").catch(() => {});
    }
  };

  const deleteNotification = (id: string | number) => {
    setNotifications((prev) =>
      prev.filter((item) => item.id !== id)
    );
    if (isAuthenticated && typeof id === "string") {
      api.patch(`/notifications/${id}/read`).catch(() => {});
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    if (isAuthenticated) {
      api.patch("/notifications/read-all").catch(() => {});
    }
  };

  const unreadCount = useMemo(() => {
    return notifications.filter(
      (item) => !item.read
    ).length;
  }, [notifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAllAsRead,
        deleteNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider."
    );
  }

  return context;
};