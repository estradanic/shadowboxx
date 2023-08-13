import React, { useMemo } from "react";
import { useTheme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Strings } from "../../resources";
import { uniqueId } from "../../utils";
import { ParseImage, AlbumAttributes } from "../../classes";
import ActionDialog, { ActionDialogProps } from "../Dialog/ActionDialog";
import ImageField from "../Field/ImageField";
import UserField from "../Field/UserField";
import TextField from "../Field/TextField";
import Tooltip from "../Tooltip/Tooltip";
import { DEFAULT_PAGE_SIZE } from "../../constants";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import useInfiniteQueryConfigs from "../../hooks/Query/useInfiniteQueryConfigs";
import useAlbumForm, { UseAlbumFormOptions } from "../../hooks/useAlbumForm";
import { useUserContext } from "../../contexts/UserContext";
import { ImageContextProvider } from "../../contexts/ImageContext";
import { useNetworkDetectionContext } from "../../contexts/NetworkDetectionContext";

/** Interface defining props for AlbumFormDialog */
export interface AlbumFormDialogProps
  extends Pick<ActionDialogProps, "open" | "handleCancel"> {
  /** Value for the component */
  value: AlbumAttributes;
  /** Function to run when the confirm button is clicked */
  handleConfirm: UseAlbumFormOptions["onSubmit"];
  /** Whether to reset dialog state when confirm button is clicked */
  resetOnConfirm?: boolean;
}

/** Component to input values for creating or editing an Album */
const AlbumFormDialog = ({
  value,
  open,
  handleCancel: piHandleCancel,
  handleConfirm: piHandleConfirm,
  resetOnConfirm = true,
}: AlbumFormDialogProps) => {
  const id = uniqueId("album-form-dialog-content");
  const {
    allImageIds,
    removedImageIds,
    coverImage,
    name,
    description,
    collaborators,
    viewers,
    captions,
    errors,
    onSubmit,
    onCancel,
    onAdd,
    onRemove,
    setCoverImage,
    setName,
    setDescription,
    setCollaborators,
    setViewers,
    setCaptions,
  } = useAlbumForm(value, {
    onSubmit: piHandleConfirm,
    onCancel: piHandleCancel,
    resetOnSubmit: resetOnConfirm,
  });
  const { online } = useNetworkDetectionContext();
  const {
    getImagesByIdInfiniteOptions,
    getImagesByIdInfiniteFunction,
    getImagesByIdInfiniteQueryKey,
  } = useInfiniteQueryConfigs();
  const { data, isFetchingNextPage, fetchNextPage } = useInfiniteQuery<
    ParseImage[],
    Error
  >(
    getImagesByIdInfiniteQueryKey(allImageIds),
    ({ pageParam: page = 0 }) =>
      getImagesByIdInfiniteFunction(
        online,
        allImageIds,
        { sortDirection: "descending" },
        {
          showErrorsInSnackbar: true,
          page,
          pageSize: DEFAULT_PAGE_SIZE,
        }
      ),
    getImagesByIdInfiniteOptions({
      refetchOnWindowFocus: false,
      enabled: open,
      staleTime: 0,
      keepPreviousData: true,
    })
  );
  useInfiniteScroll(fetchNextPage, {
    canExecute: !isFetchingNextPage && open,
    elementQuerySelector: `#${id}`,
  });
  const images = useMemo(
    () => data?.pages?.flatMap((page) => page),
    [data?.pages]
  );

  const { getLoggedInUser } = useUserContext();
  const isCollaborator = useMemo(
    () => getLoggedInUser().objectId !== value.owner?.id,
    [getLoggedInUser, value.owner?.id]
  );

  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <ActionDialog
      fullScreen={sm}
      fullWidth
      maxWidth="lg"
      open={open}
      title={name ?? Strings.label.untitledAlbum}
      message=""
      handleConfirm={onSubmit}
      handleCancel={onCancel}
      type="prompt"
      confirmButtonColor="success"
      DialogContentProps={{ id }}
    >
      <Grid container direction="row">
        <Grid item xs={12}>
          <TextField
            error={errors.name.isError}
            helperText={errors.name.errorMessage}
            autoComplete="none"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            label={Strings.label.name}
            id="name"
            type="text"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            autoComplete="none"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            label={Strings.label.description}
            id="description"
            type="text"
            multiline
          />
        </Grid>
        {!isCollaborator && (
          <>
            <Grid item xs={12}>
              <Tooltip title={Strings.label.collaboratorsTooltip}>
                <UserField
                  value={collaborators}
                  label={Strings.label.collaborators}
                  onChange={(collaborators) => setCollaborators(collaborators)}
                />
              </Tooltip>
            </Grid>
            <Grid item xs={12}>
              <Tooltip title={Strings.label.viewersTooltip}>
                <UserField
                  value={viewers}
                  label={Strings.label.viewers}
                  onChange={(viewers) => setViewers(viewers)}
                />
              </Tooltip>
            </Grid>
          </>
        )}
        <Grid item xs={12}>
          <ImageContextProvider>
            <ImageField
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
              value={
                images?.filter?.(
                  (image) => !removedImageIds.includes(image.objectId)
                ) ?? []
              }
              onRemove={async (...images) => {
                await onRemove(...images.map((image) => image.objectId));
              }}
              onAdd={async (...images) => {
                await onAdd(...images.map((image) => image.objectId));
              }}
            />
          </ImageContextProvider>
        </Grid>
      </Grid>
    </ActionDialog>
  );
};

export default AlbumFormDialog;
