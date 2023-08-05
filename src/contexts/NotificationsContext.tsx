import React, {
  useState,
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import NotificationsIcon from "@material-ui/icons/Notifications";

export enum NotificationType {
  LowStorage = "LowStorage",
  AlbumChange = "AlbumChange",
  Job = "Job",
  Error = "Error",
  Duplicates = "Duplicates",
}

/** Interface defining a single notification */
export interface Notification {
  /** Unique id of the notification */
  id: string;
  /** Type of the notification */
  type: NotificationType;
  /** Title of the notification */
  title: string;
  /** Custom icon of the notification */
  icon?: ReactNode;
  /** Detailed message or interactive content */
  detail?: React.ReactNode;
  /** Function to remove the notification */
  remove: () => void | Promise<void>;
  /** Function to update the notification */
  update?: (
    updater: (prev: Notification) => Notification
  ) => Promise<Notification>;
  /** Arbitrary data for the notification */
  data?: any;
}

/** Interface defining the parameters for the addNotification function */
interface AddNotificationParams
  extends Omit<Notification, "update" | "remove"> {
  onRemove?: () => Promise<void> | void;
  onUpdate?: (notification: Notification) => Promise<void> | void;
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
  /** Whether the notification menu is open */
  notificationMenuOpen: boolean;
  /** React state setter for notificationMenuOpen */
  setNotificationMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/** Context to manage Notifications */
const NotificationsContext = createContext<
  NotificationsContextValue | undefined
>(undefined);

/** Interface defining props for the NotificationsContextProvider */
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
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const addNotification = useCallback(
    ({
      id,
      title,
      icon = <NotificationsIcon />,
      detail,
      onRemove,
      type,
      onUpdate,
      data,
    }: AddNotificationParams): Notification => {
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
      const update = async (updater: (prev: Notification) => Notification) => {
        let notificationPromise = new Promise<Notification>((resolve) => {
          setNotifications((prev) => {
            const newNotifications: Record<string, Notification> = {};
            for (const key of Object.keys(prev)) {
              if (key !== id) {
                newNotifications[key] = prev[key];
              } else {
                newNotifications[key] = updater(prev[key]);
                resolve(newNotifications[key]);
              }
            }
            return newNotifications;
          });
        });
        const notification = await notificationPromise;
        onUpdate?.(notification);
        return notification;
      };
      const notification = {
        id,
        title,
        icon,
        detail,
        remove,
        type,
        update,
        data,
      };
      setNotifications((prev) => ({
        ...prev,
        [id]: notification,
      }));
      return notification;
    },
    [setNotifications]
  );

  const value: NotificationsContextValue = {
    notifications,
    setNotifications,
    addNotification,
    notificationMenuOpen,
    setNotificationMenuOpen,
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
