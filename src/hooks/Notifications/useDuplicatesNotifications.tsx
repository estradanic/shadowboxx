import React, { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import BurstModeIcon from "@material-ui/icons/BurstMode";
import { ParseDuplicate } from "../../classes";
import {
  useUserContext,
  useNotificationsContext,
  Notification,
} from "../../contexts";
import useQueryConfigs from "../Query/useQueryConfigs";
import { Strings } from "../../resources";
import DuplicatesNotificationDetail from "../../components/Notifications/Detail/Duplicates";

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
    })
  );

  const notificationRef = useRef<Notification>();
  useEffect(() => {
    if (duplicates?.length && !notificationRef.current) {
      notificationRef.current = addNotification({
        title: Strings.duplicatesNotificationTitle(),
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
