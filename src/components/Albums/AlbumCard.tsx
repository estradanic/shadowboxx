import React, { memo, useMemo, useState } from "react";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import IconButton from "@material-ui/core/IconButton";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import Grid from "@material-ui/core/Grid";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { makeStyles, Theme } from "@material-ui/core/styles";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import StarIcon from "@material-ui/icons/Star";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Strings } from "../../resources";
import { routes } from "../../app";
import { ParseAlbum, ParseUser, ParseImage } from "../../classes";
import { ImageContextProvider, useUserContext } from "../../contexts";
import { useQueryConfigs, useNavigate } from "../../hooks";
import UserAvatar from "../User/UserAvatar";
import Empty from "../Svgs/Empty";
import { useSnackbar } from "../Snackbar/Snackbar";
import AlbumFormDialog from "./AlbumFormDialog";
import Tooltip from "../Tooltip/Tooltip";
import { useActionDialogContext } from "../Dialog/ActionDialog";
import ImageField from "../Field/ImageField";
import Online from "../NetworkDetector/Online";
import AlbumCardSkeleton from "../Skeleton/AlbumCardSkeleton";
import Image from "../Image/Image";

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    maxWidth: theme.spacing(50),
    width: "100%",
    margin: "auto",
  },
  media: {
    cursor: "pointer",
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
  const [anchorEl, setAnchorEl] = useState<Element>();
  const [editAlbumDialogOpen, setEditAlbumDialogOpen] =
    useState<boolean>(false);

  const {
    getUserByIdQueryKey,
    getUserByIdFunction,
    getUserByIdOptions,
    getImagesByIdFunction,
    getImagesByIdOptions,
    getImagesByIdQueryKey,
    getUsersByEmailFunction,
    getUsersByEmailOptions,
    getUsersByEmailQueryKey,
    getImageByIdQueryKey,
    getImageByIdFunction,
    getImageByIdOptions,
  } = useQueryConfigs();
  const { data: owner, status: ownerStatus } = useQuery<ParseUser, Error>(
    getUserByIdQueryKey(value.owner.id),
    () => getUserByIdFunction(value.owner.id),
    getUserByIdOptions()
  );
  const { data: images } = useQuery<ParseImage[], Error>(
    getImagesByIdQueryKey(value.images),
    () => getImagesByIdFunction(value.images),
    getImagesByIdOptions()
  );
  const { data: coverImage, status: coverImageStatus } = useQuery<
    ParseImage,
    Error
  >(
    getImageByIdQueryKey(value.coverImage?.id ?? ""),
    () => getImageByIdFunction(value.coverImage?.id ?? ""),
    getImageByIdOptions({ enabled: !!value.coverImage?.id })
  );
  const { data: collaborators, status: collaboratorsStatus } = useQuery<
    ParseUser[],
    Error
  >(
    getUsersByEmailQueryKey(value.collaborators),
    () => getUsersByEmailFunction(value.collaborators),
    getUsersByEmailOptions()
  );
  const { data: viewers, status: viewersStatus } = useQuery<ParseUser[], Error>(
    getUsersByEmailQueryKey(value.viewers),
    () => getUsersByEmailFunction(value.viewers),
    getUsersByEmailOptions()
  );

  const status = useMemo(() => {
    if (
      ownerStatus === "error" ||
      collaboratorsStatus === "error" ||
      viewersStatus === "error" ||
      coverImageStatus === "error"
    ) {
      return "error";
    }
    if (
      ownerStatus === "loading" ||
      collaboratorsStatus === "loading" ||
      viewersStatus === "loading" ||
      (value.coverImage?.id && coverImageStatus === "loading")
    ) {
      return "loading";
    }
    return "success";
  }, [
    ownerStatus,
    viewersStatus,
    collaboratorsStatus,
    coverImageStatus,
    value.coverImage?.id,
  ]);

  const { getLoggedInUser, updateLoggedInUser } = useUserContext();
  const isViewer = useMemo(
    () =>
      getLoggedInUser().id !== value.owner.id &&
      !value.collaborators.includes(getLoggedInUser().email) &&
      value.viewers.includes(getLoggedInUser().email),
    [getLoggedInUser, value.owner.id, value.collaborators, value.viewers]
  );
  const isOwner = useMemo(
    () => getLoggedInUser().id === value.owner.id,
    [getLoggedInUser, value.owner.id]
  );

  const location = useLocation();

  const { enqueueErrorSnackbar, enqueueSuccessSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const classes = useStyles();
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
      navigate(routes.Album.path.replace(":id", value.id), location);
    }
  };

  const [isFavorite, setIsFavorite] = useState(
    !!value.id && getLoggedInUser().favoriteAlbums.includes(value.id)
  );

  return status !== "loading" ? (
    <ImageContextProvider>
      <Card className={classes.card}>
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
                  <MoreVertIcon className={classes.icon} />
                </IconButton>
                <Menu
                  open={!!anchorEl}
                  anchorEl={anchorEl}
                  onClose={closeMenu}
                  onClick={closeMenu}
                >
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
          subheader={`${Strings.numOfPhotos(value.images.length)} ${
            value?.description ?? ""
          }`}
        />
        {coverImage ? (
          <CardMedia
            className={classes.media}
            parseImage={coverImage}
            variant="contained"
            component={Image}
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
            <Online>
              <IconButton
                name="favorite"
                onClick={async () => {
                  if (!value.id) {
                    return;
                  }
                  if (isFavorite) {
                    getLoggedInUser().favoriteAlbums.splice(
                      getLoggedInUser().favoriteAlbums.indexOf(value.id),
                      1
                    );
                  } else {
                    getLoggedInUser().favoriteAlbums.push(value.id);
                  }
                  getLoggedInUser().update(async (loggedInUser, reason) => {
                    await updateLoggedInUser(loggedInUser, reason);
                    setIsFavorite(
                      !!value.id &&
                        loggedInUser.favoriteAlbums.includes(value.id)
                    );
                  });
                }}
              >
                <StarIcon
                  className={isFavorite ? classes.favorite : classes.icon}
                />
              </IconButton>
            </Online>
            {!isViewer && (
              <Online>
                <ImageField
                  multiple
                  ButtonProps={{ className: classes.addImages }}
                  variant="button"
                  value={images ?? []}
                  onChange={async (newImages) => {
                    try {
                      const newValue = await value.update({
                        ...value.attributes,
                        images: newImages.map((image) => image.id!),
                      });
                      await onChange(newValue);
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
  ) : (
    <AlbumCardSkeleton />
  );
});

export default AlbumCard;
