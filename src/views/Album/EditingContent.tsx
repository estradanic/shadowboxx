import React, { Dispatch, SetStateAction, useEffect, useMemo } from "react";
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

type UseStylesParams = { isNew: boolean };

const useStyles = makeStyles((theme: Theme) => ({
  fieldGrid: {
    marginBottom: theme.spacing(1),
    width: "100%",
  },
  saveFab: {
    transform: ({ isNew }: UseStylesParams) =>
      isNew ? undefined : `translateX(calc(-100% - ${theme.spacing(1)}px))`,
  },
  resetFab: {
    transform: ({ isNew }: UseStylesParams) =>
      isNew
        ? `translateX(calc(-100% - ${theme.spacing(1)}px))`
        : `translateX(calc(-200% - ${theme.spacing(2)}px))`,
  },
}));

interface EditingContentProps {
  album: ParseAlbum;
  onSubmit: (
    attributes: HydratedAlbumAttributes,
    changes: AlbumSaveContext
  ) => Promise<void>;
  images: ParseImage[];
  setEditMode: Dispatch<SetStateAction<boolean>>;
  filterBarProps: FilterBarProps;
  isNew: boolean;
}

const EditingContent = ({
  setEditMode,
  album,
  onSubmit: piOnSubmit,
  images,
  filterBarProps,
  isNew,
}: EditingContentProps) => {
  const classes = useStyles({ isNew });
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
  } = useAlbumForm({ ...album.attributes, images }, { onSubmit: piOnSubmit });
  const { getLoggedInUser } = useUserContext();
  const isCollaborator = useMemo(
    () => getLoggedInUser().objectId !== album.owner?.id,
    [getLoggedInUser, album.owner?.id]
  );
  const { enqueueWarningSnackbar, closeSnackbar } = useSnackbar();

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
          setEditMode(false);
          await onSubmit();
        }}
      >
        <SaveIcon />
      </Fab>
      {!isNew && (
        <Fab
          color="error"
          onClick={async () => {
            setEditMode(false);
            await onCancel();
          }}
        >
          <CloseIcon />
        </Fab>
      )}
    </>
  );
};

export default EditingContent;
