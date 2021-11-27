import React, { useEffect, useMemo, useState } from "react";
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
import { MoreVert, Public, Star } from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import Strings from "../../resources/Strings";
import UserAvatar from "../User/UserAvatar";
import Album from "../../types/Album";
import Empty from "../Svgs/Empty";
import { useSnackbar } from "../Snackbar/Snackbar";
import { AlbumFormDialog } from "..";
import Tooltip from "../Tooltip/Tooltip";
import { useActionDialogContext } from "../Dialog/ActionDialog";
import { isNullOrWhitespace } from "../../utils/stringUtils";
import { useRoutes } from "../../app/routes";
import Parse from "parse";

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    maxWidth: theme.spacing(50),
    minWidth: theme.spacing(50),
    margin: "auto",
    marginBottom: theme.spacing(2),
  },
  cardMobile: {
    width: `calc(100vw - ${theme.spacing(4)}px)`,
    margin: "auto",
    marginBottom: theme.spacing(2),
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
  public: {
    marginLeft: "auto",
  },
  isPublic: {
    color: theme.palette.success.main,
  },
  updatedAt: {
    float: "right",
  },
  createdAt: {
    textAlign: "left",
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
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
  value: Parse.Object<Album>;
  /** Function that signals to the parent component that something has changed and album should be refetched */
  onChange: () => void;
}

/** Component for displaying basic information about an album */
const AlbumCard = ({ value, onChange }: AlbumCardProps) => {
  const [collaborators, setCollaborators] = useState<Parse.User[]>();
  const [viewers, setViewers] = useState<Parse.User[]>();
  const [coOwners, setCoOwners] = useState<Parse.User[]>();
  const [owner, setOwner] = useState<Parse.User>();
  const [isFavorite, setIsFavorite] = useState<boolean>(
    value?.get("isFavorite") ?? false
  );
  const [isPublic, setIsPublic] = useState<boolean>(
    value?.get("isPublic") ?? false
  );

  useEffect(() => {
    value
      ?.get("collaborators")
      ?.query()
      .findAll()
      .then((response) => setCollaborators(response));
    value
      ?.get("viewers")
      ?.query()
      .findAll()
      .then((response) => setViewers(response));
    value
      ?.get("coOwners")
      ?.query()
      .findAll()
      .then((response) => setCoOwners(response));
    new Parse.Query<Parse.User>("User")
      .equalTo("objectId", value?.get("owner")?.objectId)
      .first()
      .then((response) => setOwner(response));
  }, [value]);

  const { enqueueErrorSnackbar, enqueueSuccessSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<Element>();
  const [editAlbumDialogOpen, setEditAlbumDialogOpen] = useState<boolean>(
    false
  );
  const history = useHistory();
  const { routes } = useRoutes();
  const coverImage = useMemo(
    () =>
      value?.get("images")?.find((image) => image?.metadata()?.isCoverImage) ??
      value?.get("images")?.[0],
    [value]
  );
  const coverImageSrc = useMemo(() => {
    if (isNullOrWhitespace(coverImage?.url())) {
      if (isNullOrWhitespace(coverImage?.name())) {
        return null;
      } else {
        const url = new URL("/api/GetImage", window.location.origin);
        url.searchParams.append("fileName", coverImage?.name() ?? "");
        return url.href;
      }
    } else {
      return coverImage?.url();
    }
  }, [coverImage]);

  const classes = useStyles();
  const theme = useTheme();
  const xs = useMediaQuery(theme.breakpoints.down("xs"));
  const { openConfirm } = useActionDialogContext();

  const deleteAlbum = () => {
    closeMenu();
    openConfirm(
      Strings.deleteAlbumConfirmation(),
      () => {
        value
          .destroy()
          .then(() => {
            onChange();
            enqueueSuccessSnackbar(Strings.deleteAlbumSuccess());
          })
          .catch((error) => {
            enqueueErrorSnackbar(error?.message ?? Strings.deleteAlbumError());
          });
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
    const params = new URLSearchParams({ name: value?.get("name") });
    history.push(`${routes["Album"].path}?${params.toString()}`);
  };

  return (
    <>
      <Card className={xs ? classes.cardMobile : classes.card}>
        <CardHeader
          classes={{ title: classes.title }}
          avatar={<UserAvatar user={owner} />}
          action={
            <>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <MoreVert className={classes.icon} />
              </IconButton>
              <Menu open={!!anchorEl} anchorEl={anchorEl} onClose={closeMenu}>
                <MenuItem onClick={editAlbum}>{Strings.editAlbum()}</MenuItem>
                <MenuItem onClick={deleteAlbum}>
                  {Strings.deleteAlbum()}
                </MenuItem>
              </Menu>
            </>
          }
          title={value?.get("name")}
          subheader={`${Strings.numOfPhotos(
            value?.get("images")?.length ?? 0
          )} ${value?.get("description") ?? ""}`}
        />
        {coverImageSrc ? (
          <CardMedia
            className={classes.media}
            image={coverImageSrc}
            title={coverImage?.name()}
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
                color="textSecondary"
                component="p"
              >
                {Strings.createdAt(value?.get("createdAt"))}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography
                className={classes.updatedAt}
                variant="body2"
                color="textSecondary"
                component="p"
              >
                {Strings.updatedAt(value?.get("updatedAt"))}
              </Typography>
            </Grid>
            {(!!coOwners?.length ||
              !!collaborators?.length ||
              !!viewers?.length) && (
              <Grid className={classes.collaborators} item container xs={12}>
                {coOwners?.map((coOwner) => (
                  <Grid item key={coOwner?.getEmail()}>
                    <Tooltip
                      title={
                        coOwner?.get("firstName")
                          ? `${coOwner?.get("firstName")} ${coOwner?.get(
                              "lastName"
                            )}`
                          : coOwner?.getEmail() ?? ""
                      }
                    >
                      <UserAvatar
                        className={classes.collaboratorAvatar}
                        user={coOwner}
                      />
                    </Tooltip>
                  </Grid>
                ))}
                {collaborators?.map((collaborator) => (
                  <Grid item key={collaborator?.getEmail()}>
                    <Tooltip
                      title={
                        collaborator?.get("firstName")
                          ? `${collaborator?.get(
                              "firstName"
                            )} ${collaborator?.get("lastName")}`
                          : collaborator?.getEmail() ?? ""
                      }
                    >
                      <UserAvatar
                        className={classes.collaboratorAvatar}
                        user={collaborator}
                      />
                    </Tooltip>
                  </Grid>
                ))}
                {viewers?.map((viewer) => (
                  <Grid item key={viewer?.getEmail()}>
                    <Tooltip
                      title={
                        viewer?.get("firstName")
                          ? `${viewer?.get("firstName")} ${viewer?.get(
                              "lastName"
                            )}`
                          : viewer?.getEmail() ?? ""
                      }
                    >
                      <UserAvatar
                        className={classes.collaboratorAvatar}
                        user={viewer}
                      />
                    </Tooltip>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </CardContent>
        <CardActions disableSpacing>
          <IconButton
            onClick={() => {
              const oldIsFavorite = value?.get("isFavorite");
              value?.set("isFavorite", !oldIsFavorite);
              value
                ?.save()
                .then((response) => {
                  setIsFavorite(!!response?.get("isFavorite"));
                })
                .catch((error) => {
                  value?.set("isFavorite", oldIsFavorite);
                  enqueueErrorSnackbar(
                    error?.message ?? Strings.editAlbumError()
                  );
                });
            }}
          >
            <Star className={isFavorite ? classes.favorite : classes.icon} />
          </IconButton>
          <IconButton
            className={classes.public}
            onClick={() => {
              const oldIsPublic = value?.get("isPublic");
              value?.set("isPublic", !oldIsPublic);
              value
                ?.save()
                .then((response) => {
                  setIsPublic(!!response?.get("isPublic"));
                })
                .catch((error) => {
                  value?.set("isPublic", oldIsPublic);
                  enqueueErrorSnackbar(
                    error?.message ?? Strings.editAlbumError()
                  );
                });
            }}
          >
            <Public className={isPublic ? classes.isPublic : classes.icon} />
          </IconButton>
        </CardActions>
      </Card>
      <AlbumFormDialog
        value={value}
        open={editAlbumDialogOpen}
        handleCancel={() => setEditAlbumDialogOpen(false)}
        handleConfirm={(value) => {
          setEditAlbumDialogOpen(false);
          value
            ?.save()
            .then(() => {
              onChange();
            })
            .catch((error) => {
              enqueueErrorSnackbar(error?.message ?? Strings.editAlbumError());
            });
        }}
      />
    </>
  );
};

export default AlbumCard;
