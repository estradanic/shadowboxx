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
import ParseAlbum from "../../types/Album";
import Empty from "../Svgs/Empty";
import { useSnackbar } from "../Snackbar/Snackbar";
import { AlbumFormDialog } from "..";
import Tooltip from "../Tooltip/Tooltip";
import { useActionDialogContext } from "../Dialog/ActionDialog";
import { useRoutes } from "../../app/routes";
import ParseUser from "../../types/User";
import ParseImage from "../../types/Image";

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
  value: ParseAlbum;
  /** Function that signals to the parent component that something has changed and album should be refetched */
  onChange: () => void;
}

/** Component for displaying basic information about an album */
const AlbumCard = ({ value: initialValue, onChange }: AlbumCardProps) => {
  const [value, setValue] = useState<ParseAlbum>(initialValue);

  const [images, setImages] = useState<ParseImage[]>([]);
  const [coOwners, setCoOwners] = useState<ParseUser[]>([]);
  const [collaborators, setCollaborators] = useState<ParseUser[]>([]);
  const [viewers, setViewers] = useState<ParseUser[]>([]);
  const [owner, setOwner] = useState<ParseUser>();

  useEffect(() => {
    ParseUser.query()
      .equalTo(ParseUser.COLUMNS.email, value.owner)
      .first()
      .then((response) => {
        setOwner(new ParseUser(response!));
      });
  }, [value.owner]);

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
      .containedIn(ParseUser.COLUMNS.email, value.coOwners)
      .findAll()
      .then((response) => {
        setCoOwners(response.map((coOwner) => new ParseUser(coOwner)));
      });
  }, [value.coOwners]);

  useEffect(() => {
    ParseUser.query()
      .containedIn(ParseUser.COLUMNS.email, value.collaborators)
      .findAll()
      .then((response) => {
        setCollaborators(response.map((coOwner) => new ParseUser(coOwner)));
      });
  }, [value.collaborators]);

  useEffect(() => {
    ParseUser.query()
      .containedIn(ParseUser.COLUMNS.email, value.viewers)
      .findAll()
      .then((response) => {
        setViewers(response.map((coOwner) => new ParseUser(coOwner)));
      });
  }, [value.viewers]);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const [isFavorite, setIsFavorite] = useState<boolean>(
    value?.isFavorite ?? false
  );
  const [isPublic, setIsPublic] = useState<boolean>(value?.isPublic ?? false);

  const { enqueueErrorSnackbar, enqueueSuccessSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<Element>();
  const [editAlbumDialogOpen, setEditAlbumDialogOpen] = useState<boolean>(
    false
  );
  const history = useHistory();
  const { routes } = useRoutes();
  const coverImage = useMemo(
    () => images?.find((image) => image.isCoverImage) ?? images?.[0],
    [images]
  );
  const coverImageSrc = useMemo(() => coverImage?.file.url(), [coverImage]);

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
    const params = new URLSearchParams({ name: value?.name });
    history.push(`${routes["Album"].path}?${params.toString()}`);
  };

  return (
    <>
      <Card className={xs ? classes.cardMobile : classes.card}>
        <CardHeader
          classes={{ title: classes.title }}
          avatar={<UserAvatar email={owner?.email!} fetchUser={() => owner!} />}
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
          title={value?.name}
          subheader={`${Strings.numOfPhotos(images?.length ?? 0)} ${
            value?.description ?? ""
          }`}
        />
        {coverImageSrc ? (
          <CardMedia
            className={classes.media}
            image={coverImageSrc}
            title={coverImage?.file.name()}
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
                {Strings.createdAt(value?.createdAt)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography
                className={classes.updatedAt}
                variant="body2"
                color="textSecondary"
                component="p"
              >
                {Strings.updatedAt(value?.updatedAt)}
              </Typography>
            </Grid>
            {(!!coOwners?.length ||
              !!collaborators?.length ||
              !!viewers?.length) && (
              <Grid className={classes.collaborators} item container xs={12}>
                {coOwners?.map((coOwner) => (
                  <Grid item key={coOwner?.email}>
                    <Tooltip
                      title={
                        coOwner?.firstName
                          ? `${coOwner?.firstName} ${coOwner?.lastName}`
                          : coOwner?.email ?? ""
                      }
                    >
                      <UserAvatar
                        className={classes.collaboratorAvatar}
                        email={coOwner.email}
                        fetchUser={() => coOwner}
                      />
                    </Tooltip>
                  </Grid>
                ))}
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
              const oldIsFavorite = value?.isFavorite;
              value.isFavorite = !oldIsFavorite;
              value
                ?.save()
                .then((response) => {
                  setIsFavorite(!!response.isFavorite);
                })
                .catch((error) => {
                  value.isFavorite = oldIsFavorite;
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
              const oldIsPublic = value?.isPublic;
              value.isPublic = !oldIsPublic;
              value
                ?.save()
                .then((response) => {
                  setIsPublic(!!response.isPublic);
                })
                .catch((error) => {
                  value.isPublic = oldIsPublic;
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
