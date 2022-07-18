import React, { memo, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  IconButton,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Grid,
  Menu,
  MenuItem,
  useMediaQuery,
} from "@material-ui/core";
import { makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import { MoreVert, Star } from "@material-ui/icons";
import { Online } from "react-detect-offline";
import { useHistory, useLocation } from "react-router-dom";
import { Strings } from "../../resources";
import { routes } from "../../app";
import { ParseAlbum } from "../../types";
import { ImageContextProvider, useUserContext } from "../../contexts";
import UserAvatar from "../User/UserAvatar";
import Empty from "../Svgs/Empty";
import { useSnackbar } from "../Snackbar/Snackbar";
import AlbumFormDialog from "./AlbumFormDialog";
import Tooltip from "../Tooltip/Tooltip";
import { useActionDialogContext } from "../Dialog/ActionDialog";
import ParseUser from "../../types/ParseUser";
import ParseImage from "../../types/ParseImage";
import { ImageField } from "../Field";

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    maxWidth: theme.spacing(50),
    minWidth: theme.spacing(50),
    margin: theme.spacing(2),
  },
  cardMobile: {
    width: `calc(100vw - ${theme.spacing(4)}px)`,
    margin: theme.spacing(2),
  },
  media: {
    cursor: "pointer",
    height: 0,
    paddingTop: "60%",
    backgroundSize: "contain",
    borderLeft: `${theme.spacing(1)}px solid ${theme.palette.background.paper}`,
    borderRight: `${theme.spacing(1)}px solid ${
      theme.palette.background.paper
    }`,
  },
  favorite: {
    color: theme.palette.warning.light,
  },
  addImages: {
    "&&& svg": {
      color: theme.palette.text.primary,
    },
    marginLeft: "auto",
  },
  updatedAt: {
    float: "right",
    color: theme.palette.text.hint,
  },
  createdAt: {
    textAlign: "left",
    color: theme.palette.text.hint,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
  },
  subheader: {
    color: theme.palette.text.hint,
  },
  icon: {
    color: theme.palette.text.primary,
  },
  collaboratorAvatar: {
    marginRight: theme.spacing(1),
  },
  cardContent: {
    paddingBottom: 0,
  },
  collaborators: {
    marginTop: theme.spacing(1),
  },
}));

/** Interface defining props for AlbumCard */
export interface AlbumCardProps {
  /** The album value to display */
  value: ParseAlbum;
  /**
   * Function to be run when the value changes.
   * Returns null if album was deleted.
   */
  onChange: (value: ParseAlbum | null) => Promise<void>;
}

/** Component for displaying basic information about an album */
const AlbumCard = memo(({ value, onChange }: AlbumCardProps) => {
  const [images, setImages] = useState<ParseImage[]>([]);
  const [collaborators, setCollaborators] = useState<ParseUser[]>([]);
  const [viewers, setViewers] = useState<ParseUser[]>([]);
  const [owner, setOwner] = useState<ParseUser>();

  const { loggedInUser } = useUserContext();
  const isViewer = useMemo(
    () =>
      loggedInUser?.id !== value.owner.id &&
      !value.collaborators.includes(loggedInUser?.email!) &&
      value.viewers.includes(loggedInUser?.email!),
    [loggedInUser, value.owner.id, value.collaborators, value.viewers]
  );
  const isOwner = useMemo(() => loggedInUser?.id === value.owner.id, [
    loggedInUser?.id,
    value.owner.id,
  ]);

  const location = useLocation();

  useEffect(() => {
    ParseUser.query()
      .equalTo(ParseUser.COLUMNS.id, value.owner.id)
      .first()
      .then((response) => {
        setOwner(new ParseUser(response!));
      });
  }, [value.owner.id]);

  useEffect(() => {
    ParseImage.query()
      .containedIn(ParseImage.COLUMNS.id, value.images)
      .findAll()
      .then((response) => {
        setImages(response.map((image) => new ParseImage(image)));
      });
  }, [value.images]);

  useEffect(() => {
    ParseUser.query()
      .containedIn(ParseUser.COLUMNS.email, value.collaborators)
      .findAll()
      .then((response) => {
        setCollaborators(
          response.map((collaborator) => new ParseUser(collaborator))
        );
      });
  }, [value.collaborators]);

  useEffect(() => {
    ParseUser.query()
      .containedIn(ParseUser.COLUMNS.email, value.viewers)
      .findAll()
      .then((response) => {
        setViewers(response.map((viewer) => new ParseUser(viewer)));
      });
  }, [value.viewers]);

  const [isFavorite, setIsFavorite] = useState<boolean>(
    value?.isFavorite ?? false
  );

  const { enqueueErrorSnackbar, enqueueSuccessSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<Element>();
  const [editAlbumDialogOpen, setEditAlbumDialogOpen] = useState<boolean>(
    false
  );
  const history = useHistory();
  const coverImage = useMemo(
    () => images?.find((image) => image.isCoverImage) ?? images?.[0],
    [images]
  );
  const coverImageSrc = useMemo(() => coverImage?.mobileFile.url(), [
    coverImage,
  ]);

  const classes = useStyles();
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { openConfirm } = useActionDialogContext();

  const deleteAlbum = () => {
    closeMenu();
    openConfirm(
      Strings.deleteAlbumConfirmation(),
      async () => {
        try {
          await value.destroy();
          await onChange(null);
          enqueueSuccessSnackbar(Strings.deleteAlbumSuccess());
        } catch (error: any) {
          enqueueErrorSnackbar(error?.message ?? Strings.deleteAlbumError());
        }
      },
      undefined,
      { confirmButtonColor: "error" }
    );
  };

  const editAlbum = () => {
    closeMenu();
    setEditAlbumDialogOpen(true);
  };

  const closeMenu = () => setAnchorEl(undefined);

  const navigateToAlbum = () => {
    if (value?.id) {
      history.push(routes["Album"].path.replace(":id", value.id), {
        previousLocation: location,
      });
    }
  };

  return (
    <ImageContextProvider>
      <Card className={mobile ? classes.cardMobile : classes.card}>
        <CardHeader
          classes={{ title: classes.title, subheader: classes.subheader }}
          avatar={<UserAvatar email={owner?.email!} fetchUser={() => owner!} />}
          action={
            isViewer ? undefined : (
              <Online>
                <IconButton
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  name="actions"
                >
                  <MoreVert className={classes.icon} />
                </IconButton>
                <Menu open={!!anchorEl} anchorEl={anchorEl} onClose={closeMenu}>
                  <MenuItem onClick={editAlbum}>{Strings.editAlbum()}</MenuItem>
                  {isOwner && (
                    <MenuItem onClick={deleteAlbum}>
                      {Strings.deleteAlbum()}
                    </MenuItem>
                  )}
                </Menu>
              </Online>
            )
          }
          title={value?.name}
          subheader={`${Strings.numOfPhotos(images?.length ?? 0)} ${
            value?.description ?? ""
          }`}
        />
        {coverImageSrc ? (
          <CardMedia
            className={classes.media}
            image={coverImageSrc}
            title={coverImage?.name}
            onClick={navigateToAlbum}
          />
        ) : (
          <Empty height={300} />
        )}
        <CardContent className={classes.cardContent}>
          <Grid container>
            <Grid item xs={6}>
              <Typography
                className={classes.createdAt}
                variant="body2"
                component="p"
              >
                {Strings.createdAt(value?.createdAt)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography
                className={classes.updatedAt}
                variant="body2"
                component="p"
              >
                {Strings.updatedAt(value?.updatedAt)}
              </Typography>
            </Grid>
            {(!!collaborators?.length || !!viewers?.length) && (
              <Grid className={classes.collaborators} item container xs={12}>
                {collaborators?.map((collaborator) => (
                  <Grid item key={collaborator?.email}>
                    <Tooltip
                      title={
                        collaborator?.firstName
                          ? `${collaborator?.firstName} ${collaborator?.lastName}`
                          : collaborator?.email ?? ""
                      }
                    >
                      <UserAvatar
                        className={classes.collaboratorAvatar}
                        email={collaborator.email}
                        fetchUser={() => collaborator}
                        key={collaborator.email}
                      />
                    </Tooltip>
                  </Grid>
                ))}
                {viewers?.map((viewer) => (
                  <Grid item key={viewer?.email}>
                    <Tooltip
                      title={
                        viewer?.firstName
                          ? `${viewer?.firstName} ${viewer?.lastName}`
                          : viewer?.email ?? ""
                      }
                    >
                      <UserAvatar
                        className={classes.collaboratorAvatar}
                        email={viewer.email}
                        fetchUser={() => viewer}
                        key={viewer.email}
                      />
                    </Tooltip>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </CardContent>
        <CardActions disableSpacing>
          <>
            {isOwner && (
              <Online>
                <IconButton
                  name="favorite"
                  onClick={async () => {
                    const oldIsFavorite = value?.isFavorite;
                    value.isFavorite = !oldIsFavorite;
                    try {
                      const response = await value?.save();
                      setIsFavorite(!!response.isFavorite);
                    } catch (error: any) {
                      value.isFavorite = oldIsFavorite;
                      enqueueErrorSnackbar(
                        error?.message ?? Strings.editAlbumError()
                      );
                    }
                  }}
                >
                  <Star
                    className={isFavorite ? classes.favorite : classes.icon}
                  />
                </IconButton>
              </Online>
            )}
            {!isViewer && (
              <Online>
                <ImageField
                  multiple
                  ButtonProps={{ className: classes.addImages }}
                  variant="button"
                  value={images}
                  onChange={async (newImages) => {
                    value.images = newImages.map((image) => image.id!);
                    try {
                      await value.save();
                      enqueueSuccessSnackbar(Strings.commonSaved());
                    } catch (error: any) {
                      enqueueErrorSnackbar(
                        error?.message ?? Strings.editAlbumError()
                      );
                    }
                  }}
                />
              </Online>
            )}
          </>
        </CardActions>
      </Card>
      <AlbumFormDialog
        value={value.attributes}
        open={editAlbumDialogOpen}
        handleCancel={() => setEditAlbumDialogOpen(false)}
        handleConfirm={async (attributes) => {
          setEditAlbumDialogOpen(false);
          try {
            const response = await value.update(attributes);
            await onChange(response);
            enqueueSuccessSnackbar(Strings.commonSaved());
          } catch (error: any) {
            enqueueErrorSnackbar(error?.message ?? Strings.editAlbumError());
          }
        }}
      />
    </ImageContextProvider>
  );
});

export default AlbumCard;
