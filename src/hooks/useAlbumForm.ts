import { useCallback, useMemo, useState } from "react";
import { AlbumAttributes, AlbumSaveContext, ParseUser } from "../classes";
import { useSnackbar } from "../components";
import { Strings } from "../resources";
import { dedupe, ErrorState, isNullOrWhitespace, deepEqual } from "../utils";
import { useActionDialogContext } from "../components/Dialog/ActionDialog";

export type AlbumFormChanges = AlbumSaveContext;

export type UseAlbumFormOptions = {
  resetOnSubmit?: boolean;
  onSubmit: (
    album: AlbumAttributes,
    changes: AlbumFormChanges
  ) => Promise<void> | void;
  onCancel?: () => Promise<void> | void;
};

const useAlbumForm = (
  album: AlbumAttributes,
  {
    resetOnSubmit = true,
    onSubmit: piOnSubmit,
    onCancel: piOnCancel,
  }: UseAlbumFormOptions
) => {
  const { openConfirm } = useActionDialogContext();
  const { enqueueErrorSnackbar } = useSnackbar();

  const [allImageIds, setAllImageIds] = useState<string[]>(album.images);
  const [removedImages, setRemovedImageIds] = useState<string[]>([]);
  const imageIds = useMemo(
    () => allImageIds.filter((imageId) => !removedImages.includes(imageId)),
    [allImageIds, removedImages]
  );

  const [coverImage, setCoverImage] = useState<AlbumAttributes["coverImage"]>(
    album.coverImage
  );
  const [name, setName] = useState<AlbumAttributes["name"]>(album.name);
  const [description, setDescription] = useState<
    AlbumAttributes["description"]
  >(album.description);
  const [collaborators, setCollaborators] = useState<
    AlbumAttributes["collaborators"]
  >(album.collaborators);
  const [viewers, setViewers] = useState<AlbumAttributes["viewers"]>(
    album.viewers
  );
  const [captions, setCaptions] = useState<AlbumAttributes["captions"]>(
    album.captions ?? {}
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
    setName(album.name);
    setDescription(album.description);
    setCollaborators(album.collaborators);
    setViewers(album.viewers);
    setErrors(defaultErrors);
    setCaptions(album.captions ?? {});
    setAllImageIds(album.images);
  }, [
    setName,
    setDescription,
    setCollaborators,
    setViewers,
    setErrors,
    album,
    defaultErrors,
    setCaptions,
  ]);

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

  const calculateChanges = (): AlbumFormChanges => {
    const addedCollaborators = dedupe(
      collaborators.filter(
        (collaborator) => !album.collaborators.includes(collaborator)
      )
    );
    const removedCollaborators = dedupe(
      album.collaborators.filter(
        (collaborator) => !collaborators.includes(collaborator)
      )
    );
    const addedViewers = dedupe(
      viewers.filter((viewer) => !album.viewers.includes(viewer))
    );
    const removedViewers = dedupe(
      album.viewers.filter((viewer) => !viewers.includes(viewer))
    );
    const addedImages = dedupe(
      imageIds.filter((imageId) => !album.images.includes(imageId))
    );
    const changes: AlbumFormChanges = {};
    if (addedCollaborators.length > 0) {
      changes.addedCollaborators = addedCollaborators;
    }
    if (removedCollaborators.length > 0) {
      changes.removedCollaborators = removedCollaborators;
    }
    if (addedViewers.length > 0) {
      changes.addedViewers = addedViewers;
    }
    if (removedViewers.length > 0) {
      changes.removedViewers = removedViewers;
    }
    if (coverImage?.id !== album.coverImage?.id) {
      changes.coverImage = coverImage?.toNativePointer();
    }
    if (name !== album.name) {
      changes.name = name;
    }
    if (description !== album.description) {
      changes.description = description;
    }
    if (removedImages.length > 0) {
      changes.removedImages = removedImages;
    }
    if (addedImages.length > 0) {
      changes.addedImages = addedImages;
    }
    if (!deepEqual(captions, album.captions)) {
      changes.captions = captions;
    }
    return changes;
  };

  const onSubmit = async () => {
    if (validate()) {
      const userEmails = new Set([...viewers, ...collaborators]);
      const signedUpUserCount = await ParseUser.query()
        .containedIn(ParseUser.COLUMNS.email, [...viewers, ...collaborators])
        .count();
      if (signedUpUserCount < userEmails.size) {
        openConfirm(Strings.nonExistentUserWarning(), async () => {
          await piOnSubmit(
            {
              ...album,
              images: imageIds,
              name,
              description,
              collaborators,
              viewers,
              coverImage,
              captions,
            },
            calculateChanges()
          );
          if (resetOnSubmit) {
            reinitialize();
          }
        });
      } else {
        await piOnSubmit(
          {
            ...album,
            images: imageIds,
            name,
            description,
            collaborators,
            viewers,
            coverImage,
            captions,
          },
          calculateChanges()
        );
      }
    }
  };

  const onCancel = async () => {
    reinitialize();
    await piOnCancel?.();
  };

  const onAdd = async (...imageIds: string[]) => {
    setAllImageIds(dedupe([...allImageIds, ...imageIds]));
    setRemovedImageIds(
      removedImages.filter((imageId) => !imageIds.includes(imageId))
    );
  };

  const onRemove = async (...imageIds: string[]) => {
    setRemovedImageIds(dedupe([...removedImages, ...imageIds]));
  };

  return {
    imageIds,
    allImageIds,
    removedImageIds: removedImages,
    coverImage,
    name,
    description,
    collaborators,
    viewers,
    captions,
    errors,
    reinitialize,
    validate,
    onSubmit,
    onCancel,
    setCoverImage,
    setName,
    setDescription,
    setCollaborators,
    setViewers,
    setCaptions,
    onAdd,
    onRemove,
  };
};

export default useAlbumForm;
