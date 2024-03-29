import React, { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import BurstModeIcon from "@material-ui/icons/BurstMode";
import { ParseDuplicate } from "../../classes";
import useQueryConfigs from "../Query/useQueryConfigs";
import { Strings } from "../../resources";
import DuplicatesNotificationDetail from "../../components/Notifications/Detail/Duplicates";
import {
  useNotificationsContext,
  Notification,
} from "../../contexts/NotificationsContext";
import { useUserContext } from "../../contexts/UserContext";

/** Hook to get/manage duplicate notifications */
const useDuplicatesNotifications = () => {
  const { addNotification } = useNotificationsContext();

  const { isUserLoggedIn } = useUserContext();

  const { getDuplicatesQueryKey, getDuplicatesOptions, getDuplicatesFunction } =
    useQueryConfigs();

  const { data: duplicates } = useQuery<ParseDuplicate[], Error>(
    getDuplicatesQueryKey(),
    () => getDuplicatesFunction(),
    getDuplicatesOptions({
      enabled: isUserLoggedIn,
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 0,
    })
  );

  const notificationRef = useRef<Notification>();
  useEffect(() => {
    if (duplicates?.length && !notificationRef.current) {
      notificationRef.current = addNotification({
        id: "duplicates-notification",
        title: Strings.message.duplicatesNotificationTitle,
        detail: (
          <DuplicatesNotificationDetail
            duplicates={duplicates}
            notificationRef={notificationRef}
          />
        ),
        icon: <BurstModeIcon />,
      });
    } else if (!duplicates?.length) {
      notificationRef.current = undefined;
    }
  }, [addNotification, notificationRef, duplicates]);
};

export default useDuplicatesNotifications;
