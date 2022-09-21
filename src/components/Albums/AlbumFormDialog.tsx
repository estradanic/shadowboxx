import React, { useCallback, useMemo, useState } from "react";
import Parse from "parse";
import uniqueId from "lodash/uniqueId";
import { useTheme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Strings } from "../../resources";
import { dedupeFast, ErrorState, isNullOrWhitespace } from "../../utils";
import { ImageContextProvider, useUserContext } from "../../contexts";
import { ParseUser, ParseImage, Album } from "../../classes";
import { useInfiniteScroll, useInfiniteQueryConfigs } from "../../hooks";
import ActionDialog, {
  ActionDialogProps,
  useActionDialogContext,
} from "../Dialog/ActionDialog";
import ImageField from "../Field/ImageField";
import { useSnackbar } from "../Snackbar/Snackbar";
import UserField from "../Field/UserField";
import TextField from "../Field/TextField";
import Tooltip from "../Tooltip/Tooltip";
import { DEFAULT_PAGE_SIZE } from "../../constants";

/** Interface defining props for AlbumFormDialog */
export interface AlbumFormDialogProps
  extends Pick<ActionDialogProps, "open" | "handleCancel"> {
  /** Value for the component */
  value: Album;
  /** Function to run when the confirm button is clicked */
  handleConfirm: (value: Album) => Promise<void>;
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
  const [imageIds, setImageIds] = useState<Album["images"]>(value.images);
  const [coverImage, setCoverImage] = useState<Album["coverImage"]>(
    value.coverImage
  );
  const [name, setName] = useState<Album["name"]>(value.name);
  const [description, setDescription] = useState<Album["description"]>(
    value.description
  );
  const [collaborators, setCollaborators] = useState<Album["collaborators"]>(
    value.collaborators
  );
  const [viewers, setViewers] = useState<Album["viewers"]>(value.viewers);

  const {
    getImagesByIdInfiniteOptions,
    getImagesByIdInfiniteFunction,
    getImagesByIdInfiniteQueryKey,
  } = useInfiniteQueryConfigs();
  const { data, isFetchingNextPage, fetchNextPage } = useInfiniteQuery<
    ParseImage[],
    Error
  >(
    getImagesByIdInfiniteQueryKey(imageIds),
    ({ pageParam: page = 0 }) =>
      getImagesByIdInfiniteFunction(imageIds, {
        showErrorsInSnackbar: true,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
      }),
    getImagesByIdInfiniteOptions({
      refetchOnWindowFocus: false,
      enabled: open,
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
    () => getLoggedInUser().id !== value.owner?.id,
    [getLoggedInUser, value.owner?.id]
  );

  const defaultErrors = useMemo(
    () => ({
      name: {
        isError: false,
        errorMessage: "",
      },
    }),
    []
  );
  const [errors, setErrors] = useState<ErrorState<"name">>(defaultErrors);

  const reinitialize = useCallback(() => {
    setName(value.name);
    setDescription(value.description);
    setCollaborators(value.collaborators);
    setViewers(value.viewers);
    setErrors(defaultErrors);
  }, [
    setName,
    setDescription,
    setCollaborators,
    setViewers,
    setErrors,
    value,
    defaultErrors,
  ]);
  const { enqueueErrorSnackbar } = useSnackbar();

  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.down("sm"));
  const { openConfirm } = useActionDialogContext();

  const validate = () => {
    const errors = defaultErrors;
    let valid = true;
    if (isNullOrWhitespace(name)) {
      errors.name = {
        isError: true,
        errorMessage: Strings.pleaseEnterA("name"),
      };
      valid = false;
    }
    let errorMessage = "";
    Object.values(errors).forEach((error) => {
      if (error.isError) {
        errorMessage += error.errorMessage + "\n";
      }
    });
    if (!valid) {
      setErrors(errors);
      enqueueErrorSnackbar(errorMessage);
    }
    return valid;
  };

  const handleConfirm = async () => {
    if (validate()) {
      const userEmails = new Set([...viewers, ...collaborators]);
      const signedUpUserCount = await new Parse.Query("User")
        .containedIn(ParseUser.COLUMNS.email, [...viewers, ...collaborators])
        .count();
      if (signedUpUserCount < userEmails.size) {
        openConfirm(Strings.nonExistentUserWarning(), async () => {
          await piHandleConfirm({
            ...value,
            images: imageIds,
            name,
            description,
            collaborators,
            viewers,
            coverImage,
          });
        });
      } else {
        await piHandleConfirm({
          ...value,
          images: imageIds,
          name,
          description,
          collaborators,
          viewers,
          coverImage,
        });
      }
      if (resetOnConfirm) {
        reinitialize();
      }
    }
  };

  const handleCancel = () => {
    reinitialize();
    piHandleCancel?.();
  };

  return (
    <ActionDialog
      fullScreen={sm}
      fullWidth
      maxWidth="lg"
      open={open}
      title={name ?? Strings.untitledAlbum()}
      message=""
      handleConfirm={handleConfirm}
      handleCancel={handleCancel}
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
            label={Strings.name()}
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
            label={Strings.description()}
            id="description"
            type="text"
            multiline
          />
        </Grid>
        {!isCollaborator && (
          <>
            <Grid item xs={12}>
              <Tooltip title={Strings.collaboratorsTooltip()}>
                <UserField
                  value={collaborators}
                  label={Strings.collaborators()}
                  onChange={(collaborators) => setCollaborators(collaborators)}
                />
              </Tooltip>
            </Grid>
            <Grid item xs={12}>
              <Tooltip title={Strings.viewersTooltip()}>
                <UserField
                  value={viewers}
                  label={Strings.viewers()}
                  onChange={(viewers) => setViewers(viewers)}
                />
              </Tooltip>
            </Grid>
          </>
        )}
        <Grid item xs={12}>
          <ImageContextProvider>
            <ImageField
              coverImage={coverImage ?? images?.[0]?.toPointer()}
              setCoverImage={setCoverImage}
              label={Strings.images()}
              multiple
              value={images ?? []}
              onChange={async (value, reason) => {
                let newImageIds = imageIds;
                switch (reason) {
                  case "ADD":
                    newImageIds = dedupeFast<string>([
                      ...imageIds,
                      ...value
                        .filter((newImage) => !!newImage.id)
                        .map((newImage) => newImage.id!),
                    ]);
                    break;
                  case "REMOVE":
                    const removedImages =
                      images?.filter(
                        (image) =>
                          !value
                            .map((newImage) => newImage.id)
                            .includes(image.id)
                      ) ?? [];
                    newImageIds = imageIds.filter(
                      (imageId) =>
                        !removedImages
                          .map((removedImage) => removedImage.id)
                          .includes(imageId)
                    );
                }
                setImageIds(newImageIds);
              }}
            />
          </ImageContextProvider>
        </Grid>
      </Grid>
    </ActionDialog>
  );
};

export default AlbumFormDialog;
