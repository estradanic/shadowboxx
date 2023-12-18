import React, { useMemo } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import useInfiniteQueryConfigs from "../../hooks/Query/useInfiniteQueryConfigs";
import { HydratedAlbumAttributes } from "../../hooks/useAlbumForm";
import { ParseAlbum, ParseImage, UnpersistedParseAlbum } from "../../classes";
import { useQueryClient } from "@tanstack/react-query";
import {
  Fab,
  ImageField,
  TextField,
  Tooltip,
  UserField,
  useSnackbar,
} from "../../components";
import { Strings } from "../../resources";
import useNavigate from "../../hooks/useNavigate";
import useAlbumForm from "../../hooks/useAlbumForm";
import Grid from "@material-ui/core/Grid";
import { ImageContextProvider } from "../../contexts/ImageContext";
import SaveIcon from "@material-ui/icons/Save";
import CloseIcon from "@material-ui/icons/Close";
import useImageJobs from "../../hooks/useImageJobs";
import { JobInfo } from "../../contexts/JobContext";
import { useUserContext } from "../../contexts/UserContext";

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

const NewAlbumContent = () => {
  const classes = useStyles();
  const tempAlbumId = useMemo(
    () => `new-${Math.random().toString(36).substring(2, 9)}`,
    []
  );
  const album = new UnpersistedParseAlbum({ objectId: tempAlbumId });
  const albumJobs = useImageJobs(tempAlbumId);
  const { getLoggedInUser } = useUserContext();

  const { enqueueSuccessSnackbar, enqueueErrorSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const { getAllAlbumsInfiniteQueryKey } = useInfiniteQueryConfigs();
  const queryClient = useQueryClient();

  const submit = async (attributes: HydratedAlbumAttributes) => {
    try {
      const newAlbum = await new UnpersistedParseAlbum({
        images: attributes.images.map((image) => image.objectId),
        name: attributes.name,
        description: attributes.description,
        collaborators: attributes.collaborators,
        viewers: attributes.viewers,
        coverImage: attributes.coverImage,
        owner: getLoggedInUser().toPointer(),
        captions: attributes.captions,
      }).saveNew();
      albumJobs.forEach((job) => {
        job.update?.({
          onComplete: async (result: ParseImage, info: JobInfo<ParseImage>) => {
            await job.onComplete?.(result, info);
            await newAlbum.update(
              {
                ...newAlbum.attributes,
                images: [...newAlbum.images, result.objectId],
              },
              { addedImages: [result.objectId] }
            );
          },
          albumId: newAlbum.objectId,
        });
      });
      queryClient.setQueryData<ParseAlbum[]>(
        getAllAlbumsInfiniteQueryKey(),
        (prev) => (prev ? [...prev, newAlbum] : [newAlbum])
      );
      enqueueSuccessSnackbar(Strings.success.addingAlbum(newAlbum.name));
      navigate(`/album/${newAlbum.objectId}`);
    } catch (error: any) {
      console.error(error);
      enqueueErrorSnackbar(Strings.error.addingAlbum);
    }
  };
  const images = useMemo(() => [], []);

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
    onCancel: () => navigate("/"),
  });

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
      <Grid item xs={12} className={classes.fieldGrid}>
        <ImageContextProvider>
          <ImageField
            albumId={tempAlbumId}
            getCaption={(image) => captions[image.objectId]}
            setCaption={(image, caption) => {
              setCaptions((captions) => ({
                ...captions,
                [image.objectId]: caption,
              }));
            }}
            coverImage={coverImage ?? formImages?.[0]?.toPointer()}
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
        className={classes.saveFab}
        color="success"
        onClick={onSubmit}
      >
        <SaveIcon />
      </Fab>
      <Fab color="error" onClick={onCancel}>
        <CloseIcon />
      </Fab>
    </>
  );
};

export default NewAlbumContent;
