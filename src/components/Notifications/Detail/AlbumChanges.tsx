import React, { MutableRefObject, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { Strings } from "../../../resources";
import {
  ParseAlbum,
  ParseAlbumChangeNotification,
  ParseUser,
} from "../../../classes";
import routes from "../../../app/routes";
import { useNavigate } from "react-router-dom";
import { useNotificationsContext, Notification } from "../../../contexts/NotificationsContext";
import QueryCacheGroups from "../../../hooks/Query/QueryCacheGroups";

const useStyles = makeStyles((theme: Theme) => ({
  resolveButton: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  },
  buttonContainer: {
    textAlign: "end",
  },
  textContainer: {
    paddingTop: theme.spacing(0.5),
  },
}));

export interface AlbumChangesNotificationDetailProps {
  /** The album change records in question */
  albumChange: ParseAlbumChangeNotification;
  /** The notification record in NotificationsContext */
  notificationRef: MutableRefObject<Notification | undefined>;
}

/** Component displaying actions for the user to take about an AlbumChange notification */
const AlbumChangesNotificationDetail = ({
  albumChange,
  notificationRef = { current: undefined },
}: AlbumChangesNotificationDetailProps) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");
  const [albumName, setAlbumName] = useState<string>("");
  const queryClient = useQueryClient();
  const { setNotificationMenuOpen } = useNotificationsContext();

  useEffect(() => {
    albumChange.user.fetch<ParseUser>().then((user) => {
      setUserName(user.name);
    });
    albumChange.album.fetch<ParseAlbum>().then((album) => {
      setAlbumName(album.name);
    });
  }, [albumChange]);

  const resolve = async () => {
    await albumChange.acknowledge();
    queryClient.setQueryData(
      [QueryCacheGroups.GET_ALBUM_CHANGE_NOTIFICATIONS],
      (oldData: ParseAlbumChangeNotification[] | undefined) => {
        if (!oldData) {
          return undefined;
        }
        return oldData.filter(
          (notification) => notification.id !== albumChange.id
        );
      }
    );
    notificationRef.current?.remove();
    setNotificationMenuOpen(false);
    navigate(routes.Album.path.replace(":id", albumChange.album.id));
  };

  return (
    <Grid container>
      <Grid item xs={7} className={classes.textContainer}>
        <Typography>
          {Strings.message.albumChangeNotificationDetail(userName, albumName)}
        </Typography>
      </Grid>
      <Grid item xs={5} className={classes.buttonContainer}>
        <Button
          onClick={resolve}
          variant="contained"
          className={classes.resolveButton}
          size="small"
        >
          {Strings.action.goSee}
        </Button>
      </Grid>
    </Grid>
  );
};

export default AlbumChangesNotificationDetail;
