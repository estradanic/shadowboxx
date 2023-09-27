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
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Strings } from "../../resources";
import routes from "../../app/routes";
import { VariableColor } from "../../types";
import {
  ParseImage,
  ParseUser,
  ParseAlbum,
  Attributes,
  AlbumSaveContext,
} from "../../classes";
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
import { ImageContextProvider } from "../../contexts/ImageContext";
import { useNetworkDetectionContext } from "../../contexts/NetworkDetectionContext";
import { useUserContext } from "../../contexts/UserContext";
import useQueryConfigs from "../../hooks/Query/useQueryConfigs";
import { useJobContext } from "../../contexts/JobContext";
import { LoadingWrapper } from "../Loader";

interface UseStylesParams {
  borderColor: VariableColor;
}

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    maxWidth: theme.spacing(50),
    width: "100%",
    margin: "auto",
    border: ({ borderColor }: UseStylesParams) =>
      `2px solid ${theme.palette[borderColor ?? "primary"].dark}`,
    boxShadow: theme.shadows[5],
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
  loadingWrapper: {
    position: "relative",
    cursor: "pointer",
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
  /** Border color for the card */
  borderColor: VariableColor;
}

/** Component for displaying detailed information about an album */
const AlbumCard = memo(({ value, onChange, borderColor }: AlbumCardProps) => {
  const [anchorEl, setAnchorEl] = useState<Element>();
  const [editAlbumDialogOpen, setEditAlbumDialogOpen] =
    useState<boolean>(false);
  const { online } = useNetworkDetectionContext();

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
    () => getUserByIdFunction(online, value.owner.id),
    getUserByIdOptions()
  );
  const { data: images } = useQuery<ParseImage[], Error>(
    getImagesByIdQueryKey(value.images),
    () => getImagesByIdFunction(online, value.images),
    getImagesByIdOptions()
  );
  const { data: coverImage, status: coverImageStatus } = useQuery<
    ParseImage,
    Error
  >(
    getImageByIdQueryKey(value.coverImage?.id ?? ""),
    () => getImageByIdFunction(online, value.coverImage?.id ?? ""),
    getImageByIdOptions({ enabled: !!value.coverImage?.id })
  );
  const { data: collaborators, status: collaboratorsStatus } = useQuery<
    ParseUser[],
    Error
  >(
    getUsersByEmailQueryKey(value.collaborators),
    () => getUsersByEmailFunction(online, value.collaborators),
    getUsersByEmailOptions()
  );
  const { data: viewers, status: viewersStatus } = useQuery<ParseUser[], Error>(
    getUsersByEmailQueryKey(value.viewers),
    () => getUsersByEmailFunction(online, value.viewers),
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
      getLoggedInUser().objectId !== value.owner.id &&
      !value.collaborators.includes(getLoggedInUser().email) &&
      value.viewers.includes(getLoggedInUser().email),
    [getLoggedInUser, value.owner.id, value.collaborators, value.viewers]
  );
  const isOwner = useMemo(
    () => getLoggedInUser().objectId === value.owner.id,
    [getLoggedInUser, value.owner.id]
  );

  const { jobInfo } = useJobContext();
  const jobsForAlbum = Object.values(jobInfo).filter(
    (j) => j.albumId === value.objectId
  );
  let totalJobProgress = 0;
  for (const job of jobsForAlbum) {
    totalJobProgress += job.progress ?? 0;
  }
  const jobProgress = jobsForAlbum.length
    ? totalJobProgress / jobsForAlbum.length
    : -1;

  const location = useLocation();

  const { enqueueErrorSnackbar, enqueueSuccessSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const classes = useStyles({ borderColor });
  const { openConfirm } = useActionDialogContext();

  const deleteAlbum = () => {
    openConfirm(
      Strings.message.deleteAlbumConfirmation,
      async () => {
        try {
          await value.destroy();
          await onChange(null);
          enqueueSuccessSnackbar(Strings.success.deletingAlbum(value.name));
        } catch (error: any) {
          console.error(error);
          enqueueErrorSnackbar(Strings.error.deletingAlbum(value.name));
        }
      },
      undefined,
      { confirmButtonColor: "error" }
    );
  };

  const editAlbum = () => {
    setEditAlbumDialogOpen(true);
  };

  const closeMenu = () => setAnchorEl(undefined);

  const navigateToAlbum = () => {
    if (value?.objectId) {
      navigate(routes.Album.path.replace(":id", value.objectId), location);
    }
  };

  const [isFavorite, setIsFavorite] = useState(
    !!value.objectId &&
      getLoggedInUser().favoriteAlbums.includes(value.objectId)
  );

  const save = async (
    attributes: Attributes<"Album">,
    changes: AlbumSaveContext
  ) => {
    await value.update(attributes, changes);
    await onChange(value);
  };

  return status !== "loading" ? (
    <ImageContextProvider>
      <Card className={classes.card}>
        <CardHeader
          classes={{ title: classes.title, subheader: classes.subheader }}
          avatar={<UserAvatar UseUserInfoParams={{ user: owner! }} />}
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
                  <MenuItem onClick={editAlbum}>
                    {Strings.action.editAlbum}
                  </MenuItem>
                  {isOwner && (
                    <MenuItem onClick={deleteAlbum}>
                      {Strings.action.deleteAlbum}
                    </MenuItem>
                  )}
                </Menu>
              </Online>
            )
          }
          title={value?.name}
          subheader={`${Strings.label.numOfMemories(value.images.length)} ${
            value?.description ?? ""
          }`}
        />
        {coverImage ? (
          <LoadingWrapper
            className={classes.loadingWrapper}
            global={false}
            loading={!!jobsForAlbum.length}
            type={
              [0, -1, 100].includes(jobProgress)
                ? "indeterminate"
                : "determinate"
            }
            progress={jobProgress}
            onClick={navigateToAlbum}
            color={borderColor}
          >
            <CardMedia
              className={classes.media}
              parseImage={coverImage}
              variant="contained"
              component={Image}
              title={coverImage?.name}
              onClick={navigateToAlbum}
            />
          </LoadingWrapper>
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
                {Strings.label.createdAt(value?.createdAt)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography
                className={classes.updatedAt}
                variant="body2"
                component="p"
              >
                {Strings.label.updatedAt(value?.updatedAt)}
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
                        UseUserInfoParams={{ user: collaborator }}
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
                        UseUserInfoParams={{ user: viewer }}
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
                  if (!value.objectId) {
                    return;
                  }
                  if (isFavorite) {
                    getLoggedInUser().favoriteAlbums.splice(
                      getLoggedInUser().favoriteAlbums.indexOf(value.objectId),
                      1
                    );
                  } else {
                    getLoggedInUser().favoriteAlbums.push(value.objectId);
                  }
                  getLoggedInUser().update(async (loggedInUser, reason) => {
                    await updateLoggedInUser(loggedInUser, reason);
                    setIsFavorite(
                      !!value.objectId &&
                        loggedInUser.favoriteAlbums.includes(value.objectId)
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
                  albumId={value.objectId}
                  onAdd={async (...images) => {
                    if (!value.objectId) {
                      return;
                    }
                    const imageIds = images.map((image) => image.objectId);
                    const newAttributes = { ...value.attributes };
                    newAttributes.images.push(...imageIds);
                    await save(newAttributes, { addedImages: imageIds });
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
        handleConfirm={async (attributes, changes) => {
          setEditAlbumDialogOpen(false);
          try {
            const response = await value.update(attributes, changes);
            await onChange(response);
            enqueueSuccessSnackbar(Strings.success.saved);
          } catch (error: any) {
            console.error(error);
            enqueueErrorSnackbar(Strings.error.editingAlbum);
          }
        }}
      />
    </ImageContextProvider>
  ) : (
    <AlbumCardSkeleton />
  );
});

export default AlbumCard;
