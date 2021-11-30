import React, { useState, createContext, useContext, ReactNode } from "react";
import { v4 as uuid } from "uuid";
import { Notifications } from "@material-ui/icons";

/** Interface defining a single notification */
export interface Notification {
  /** Unique id of the notification */
  id: string;
  /** Title of the notification */
  title: string;
  /** Custom icon of the notification */
  icon?: ReactNode;
  /** Detailed message or interactive content */
  detail?: React.ReactNode;
  /** Name of the notification group */
  groupName?: string;
  /** Function to remove the notification */
  remove: () => void;
}

/** Interface defining the parameters for the addNotification function */
interface AddNotificationParams
  extends Pick<Notification, "title" | "icon" | "detail" | "groupName"> {}

/** Interface defining the value of NotifcationsContextProvider */
interface NotificationsContextValue {
  /** An array of notifications */
  notifications: Notification[];
  /** React state setter for notifications */
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  /** Function to easily add a new notification, automatically setting id and remove */
  addNotification: (params: AddNotificationParams) => Notification;
}

/** Context to manage Notifications */
const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

/**
 * Interface defining props for the NotificationsContextProvider
 */
interface NotificationsContextProviderProps {
  /** Child node */
  children: React.ReactNode;
}

/** Custom context provider for NotificationsContext */
export const NotificationsContextProvider = ({
  children,
}: NotificationsContextProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const addNotification = ({
    title,
    icon = <Notifications />,
    detail,
    groupName,
  }: AddNotificationParams) => {
    const id = uuid();
    const remove = () =>
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      );
    setNotifications((prev) => [
      ...prev,
      { id, title, icon, detail, groupName, remove },
    ]);
    return { id, title, icon, detail, groupName, remove };
  };

  const value: NotificationsContextValue = {
    notifications,
    setNotifications,
    addNotification,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

/** Alias to useContext(NotificationsContext) */
export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('No NotificationsContextProvider!');
  }
  return context;
}
