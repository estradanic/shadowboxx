import React, { useEffect, MutableRefObject, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import FiberNewIcon from "@material-ui/icons/FiberNew";
import { ParseAlbumChangeNotification } from "../../classes";
import useQueryConfigs from "../Query/useQueryConfigs";
import { Strings } from "../../resources";
import AlbumChangesNotificationDetail from "../../components/Notifications/Detail/AlbumChanges";
import {
  useNotificationsContext,
  Notification,
  NotificationType,
} from "../../contexts/NotificationsContext";
import { useUserContext } from "../../contexts/UserContext";

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
  const queryClient = useQueryClient();

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

  const onRemove = useCallback(
    async (albumChangeNotification: ParseAlbumChangeNotification) => {
      await albumChangeNotification.acknowledge();
      queryClient.invalidateQueries({
        queryKey: getAlbumChangeNotificationsQueryKey(),
      });
    },
    [queryClient, getAlbumChangeNotificationsQueryKey]
  );

  useEffect(() => {
    if (albumChangeNotifications?.length) {
      albumChangeNotifications.forEach((albumChangeNotification) => {
        if (!notificationRef.current[albumChangeNotification.id]?.current) {
          notificationRef.current[albumChangeNotification.id] = {
            current: undefined,
          };
          notificationRef.current[albumChangeNotification.id].current =
            addNotification({
              id: albumChangeNotification.id,
              title: Strings.message.albumChangeNotificationTitle(
                albumChangeNotification.count
              ),
              detail: (
                <AlbumChangesNotificationDetail
                  albumChange={albumChangeNotification}
                  notificationRef={
                    notificationRef.current[albumChangeNotification.id]
                  }
                />
              ),
              icon: <FiberNewIcon />,
              onRemove: async () => await onRemove(albumChangeNotification),
              type: NotificationType.AlbumChange,
            });
        }
      });
    }
  }, [addNotification, albumChangeNotifications, notificationRef, onRemove]);
};

export default useAlbumChangeNotifications;
