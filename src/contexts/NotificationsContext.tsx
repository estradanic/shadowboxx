import React, {
  useState,
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { v4 as uuid } from "uuid";
import NotificationsIcon from "@material-ui/icons/Notifications";

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
  /** Function to remove the notification */
  remove: () => void | Promise<void>;
}

/** Interface defining the parameters for the addNotification function */
interface AddNotificationParams
  extends Pick<Notification, "title" | "icon" | "detail" | "id"> {
  onRemove?: () => Promise<void> | void;
}

/** Interface defining the value of NotifcationsContextProvider */
interface NotificationsContextValue {
  /** An array of notifications */
  notifications: Record<string, Notification>;
  /** React state setter for notifications */
  setNotifications: React.Dispatch<
    React.SetStateAction<Record<string, Notification>>
  >;
  /**
   * Function to easily add a new notification.
   * If notification with id already exists, it is updated to the new one
   */
  addNotification: (params: AddNotificationParams) => Notification;
}

/** Context to manage Notifications */
const NotificationsContext = createContext<
  NotificationsContextValue | undefined
>(undefined);

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
  const [notifications, setNotifications] = useState<
    Record<string, Notification>
  >({});
  const addNotification = useCallback(
    ({
      id,
      title,
      icon = <NotificationsIcon />,
      detail,
      onRemove,
    }: AddNotificationParams) => {
      const remove = async () => {
        setNotifications((prev) => {
          const newNotifications: Record<string, Notification> = {};
          for (const key of Object.keys(prev)) {
            if (key !== id) {
              newNotifications[key] = prev[key];
            }
          }
          return newNotifications;
        });
        await onRemove?.();
      };
      setNotifications((prev) => ({
        ...prev,
        [id]: { id, title, icon, detail, remove },
      }));
      return { id, title, icon, detail, remove };
    },
    [setNotifications]
  );

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
  if (context === undefined) {
    throw new Error("No NotificationsContextProvider found!");
  }
  return context;
};
