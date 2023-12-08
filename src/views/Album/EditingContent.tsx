import React, { useEffect, useMemo } from "react";
import Grid from "@material-ui/core/Grid";
import CloseIcon from "@material-ui/icons/Close";
import SaveIcon from "@material-ui/icons/Save";
import RestoreIcon from "@material-ui/icons/Restore";
import { AlbumSaveContext, ParseAlbum, ParseImage } from "../../classes";
import useAlbumForm, {
  HydratedAlbumAttributes,
} from "../../hooks/useAlbumForm";
import {
  Fab,
  ImageField,
  TextField,
  Tooltip,
  UserField,
  useSnackbar,
} from "../../components";
import { useUserContext } from "../../contexts/UserContext";
import { Strings } from "../../resources";
import { ImageContextProvider } from "../../contexts/ImageContext";
import { FilterBarProps } from "../../components/FilterBar/FilterBar";
import { makeStyles, Theme } from "@material-ui/core/styles";
import useNavigate from "../../hooks/useNavigate";
import { useQueryClient } from "@tanstack/react-query";
import useQueryConfigs from "../../hooks/Query/useQueryConfigs";

const useStyles = makeStyles((theme: Theme) => ({
  fieldGrid: {
    marginBottom: theme.spacing(1),
    width: "100%",
  },
  saveFab: {
    transform: `translateX(calc(-100% - ${theme.spacing(1)}px))`,
  },
  resetFab: {
    transform: `translateX(calc(-200% - ${theme.spacing(2)}px))`,
  },
}));

interface EditingContentProps {
  album: ParseAlbum;
  images: ParseImage[];
  filterBarProps: FilterBarProps;
}

const EditingContent = ({
  album,
  images,
  filterBarProps,
}: EditingContentProps) => {
  const classes = useStyles();

  const {
    enqueueSuccessSnackbar,
    enqueueErrorSnackbar,
    enqueueWarningSnackbar,
    closeSnackbar,
  } = useSnackbar();
  const queryClient = useQueryClient();
  const { getAlbumQueryKey } = useQueryConfigs();
  const submit = async (
    attributes: HydratedAlbumAttributes,
    changes: AlbumSaveContext
  ) => {
    try {
      await album.update(
        {
          ...attributes,
          images: attributes.images.map((image) => image.objectId),
        },
        changes
      );
      queryClient.setQueryData<ParseAlbum>(
        getAlbumQueryKey(album.objectId),
        album
      );
      enqueueSuccessSnackbar(Strings.success.saved);
    } catch (error: any) {
      console.error(error);
      enqueueErrorSnackbar(Strings.error.editingAlbum);
    }
  };

  const {
    name,
    setName,
    description,
    setDescription,
    collaborators,
    setCollaborators,
    viewers,
    setViewers,
    captions,
    setCaptions,
    coverImage,
    setCoverImage,
    onRemove,
    onAdd,
    onSubmit,
    onCancel,
    isDirty,
    images: formImages,
    onUpdate,
  } = useAlbumForm(album, images, {
    onSubmit: submit,
    onCancel: () => navigate(".."),
  });
  const { getLoggedInUser } = useUserContext();
  const isCollaborator = useMemo(
    () => getLoggedInUser().objectId !== album.owner?.id,
    [getLoggedInUser, album.owner?.id]
  );
  const navigate = useNavigate();

  useEffect(() => {
    const snackbarKey = enqueueWarningSnackbar(Strings.label.editMode, {
      persist: true,
    });
    return () => closeSnackbar(snackbarKey);
  }, []);

  return (
    <>
      <Grid item xs={12} className={classes.fieldGrid}>
        <TextField
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          label={Strings.label.name}
        />
      </Grid>
      <Grid item xs={12} className={classes.fieldGrid}>
        <TextField
          fullWidth
          multiline
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          label={Strings.label.description}
        />
      </Grid>
      {!isCollaborator && (
        <>
          <Grid item xs={12} className={classes.fieldGrid}>
            <Tooltip title={Strings.label.collaboratorsTooltip}>
              <UserField
                fullWidth
                value={collaborators}
                label={Strings.label.collaborators}
                onChange={(collaborators) => setCollaborators(collaborators)}
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12} className={classes.fieldGrid}>
            <Tooltip title={Strings.label.viewersTooltip}>
              <UserField
                fullWidth
                value={viewers}
                label={Strings.label.viewers}
                onChange={(viewers) => setViewers(viewers)}
              />
            </Tooltip>
          </Grid>
        </>
      )}
      <Grid item xs={12} className={classes.fieldGrid}>
        <ImageContextProvider>
          <ImageField
            filterBarProps={filterBarProps}
            albumId={album.objectId}
            getCaption={(image) => captions[image.objectId]}
            setCaption={(image, caption) => {
              setCaptions((captions) => ({
                ...captions,
                [image.objectId]: caption,
              }));
            }}
            coverImage={coverImage ?? images?.[0]?.toPointer()}
            setCoverImage={setCoverImage}
            label={Strings.label.images}
            multiple
            value={formImages}
            onRemove={onRemove}
            onAdd={onAdd}
            onUpdate={onUpdate}
          />
        </ImageContextProvider>
      </Grid>
      <Fab
        disabled={!isDirty}
        className={classes.resetFab}
        color="primary"
        onClick={onCancel}
      >
        <RestoreIcon />
      </Fab>
      <Fab
        disabled={!isDirty}
        className={classes.saveFab}
        color="success"
        onClick={async () => {
          await onSubmit();
          navigate("..");
        }}
      >
        <SaveIcon />
      </Fab>
      <Fab color="error" onClick={onCancel}>
        <CloseIcon />
      </Fab>
    </>
  );
};

export default EditingContent;
