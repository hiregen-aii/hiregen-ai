import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

export interface NotificationItem {
  id: number;
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

  deleteNotification: (id: number) => void;
  clearNotifications: () => void;
}

const NotificationContext =
  createContext<NotificationContextType | null>(
    null
  );

export const NotificationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [notifications, setNotifications] = useState<
    NotificationItem[]
  >([]);

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
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const clearNotifications = () => {
  setNotifications([]);
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