import React, { useEffect, MutableRefObject, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import FiberNewIcon from "@material-ui/icons/FiberNew";
import { ParseAlbumChangeNotification } from "../../classes";
import {
  useUserContext,
  useNotificationsContext,
  Notification,
} from "../../contexts";
import useQueryConfigs from "../Query/useQueryConfigs";
import { Strings } from "../../resources";
import AlbumChangesNotificationDetail from "../../components/Notifications/Detail/AlbumChanges";

const useAlbumChangeNotifications = () => {
  const { addNotification } = useNotificationsContext();
  const { isUserLoggedIn } = useUserContext();
  const notificationRef = useRef<
    Record<string, MutableRefObject<Notification | undefined>>
  >({});

  const {
    getAlbumChangeNotificationsQueryKey,
    getAlbumChangeNotificationsOptions,
    getAlbumChangeNotificationsFunction,
  } = useQueryConfigs();

  const { data: albumChangeNotifications } = useQuery<
    ParseAlbumChangeNotification[],
    Error
  >(
    getAlbumChangeNotificationsQueryKey(),
    () => getAlbumChangeNotificationsFunction(),
    getAlbumChangeNotificationsOptions({
      enabled: isUserLoggedIn,
      staleTime: 1000 * 60 * 5, // 5 minutes
    })
  );

  useEffect(() => {
    if (albumChangeNotifications?.length) {
      albumChangeNotifications.forEach((albumChangeNotification) => {
        if (!notificationRef.current[albumChangeNotification.id!]?.current) {
          notificationRef.current[albumChangeNotification.id!] = {
            current: undefined,
          };
          notificationRef.current[albumChangeNotification.id!].current =
            addNotification({
              id: albumChangeNotification.id!,
              title: Strings.albumChangeNotificationTitle(),
              detail: (
                <AlbumChangesNotificationDetail
                  albumChange={albumChangeNotification}
                  notificationRef={
                    notificationRef.current[albumChangeNotification.id!]
                  }
                />
              ),
              icon: <FiberNewIcon />,
              onRemove: async () => await albumChangeNotification.acknowledge(),
            });
        }
      });
    }
  }, [addNotification, albumChangeNotifications, notificationRef]);
};

export default useAlbumChangeNotifications;
