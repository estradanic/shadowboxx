import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlbumAttributes,
  AlbumSaveContext,
  ParseAlbum,
  ParseImage,
  ParseUser,
} from "../classes";
import { useSnackbar } from "../components";
import { Strings } from "../resources";
import { dedupe, ErrorState, isNullOrWhitespace, deepEqual } from "../utils";
import { useActionDialogContext } from "../components/Dialog/ActionDialog";
import { useGlobalLoadingStore } from "../stores";
import { useQueryClient } from "@tanstack/react-query";
import QueryCacheGroups from "./Query/QueryCacheGroups";

export type AlbumFormChanges = AlbumSaveContext;

export type HydratedAlbumAttributes = Omit<AlbumAttributes, "images"> & {
  images: ParseImage[];
};

export type UseAlbumFormOptions = {
  /** Whether to reset the form after submitting */
  resetOnSubmit?: boolean;
  /** Callback when the form is submitted */
  onSubmit: (
    album: HydratedAlbumAttributes,
    changes: AlbumFormChanges
  ) => Promise<void> | void;
  /** Callback when the form is cancelled */
  onCancel?: () => Promise<void> | void;
};

/** Hook to manage an album form */
const useAlbumForm = (
  album: ParseAlbum,
  albumImages: ParseImage[],
  {
    resetOnSubmit = true,
    onSubmit: piOnSubmit,
    onCancel: piOnCancel,
  }: UseAlbumFormOptions
) => {
  const { openConfirm } = useActionDialogContext();
  const { enqueueErrorSnackbar } = useSnackbar();
  const { startGlobalLoader, stopGlobalLoader } = useGlobalLoadingStore();
  const queryClient = useQueryClient();

  const [allImages, setAllImages] = useState<ParseImage[]>(albumImages);
  const [removedImages, setRemovedImages] = useState<ParseImage[]>([]);
  const images = useMemo(
    () => allImages.filter((imageId) => !removedImages.includes(imageId)),
    [allImages, removedImages]
  );

  useEffect(() => {
    setAllImages(dedupe([...albumImages, ...allImages]));
  }, [albumImages]);

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

  const isDirty =
    removedImages.length > 0 ||
    allImages.length !== album.images.length ||
    coverImage?.id !== album.coverImage?.id ||
    name !== album.name ||
    description !== album.description ||
    !deepEqual(captions, album.captions ?? {}) ||
    !deepEqual(collaborators, album.collaborators) ||
    !deepEqual(viewers, album.viewers);

  const reinitialize = useCallback(() => {
    setName(album.name);
    setDescription(album.description);
    setCollaborators(album.collaborators);
    setViewers(album.viewers);
    setErrors(defaultErrors);
    setCaptions(album.captions ?? {});
    setAllImages(albumImages);
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
        errorMessage: Strings.prompt.pleaseEnterA(Strings.label.name),
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
      images.filter((image) => !album.images.includes(image.objectId))
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
      changes.removedImages = removedImages.map((image) => image.objectId);
    }
    if (addedImages.length > 0) {
      changes.addedImages = addedImages.map((image) => image.objectId);
    }
    if (!deepEqual(captions, album.captions)) {
      changes.captions = captions;
    }
    return changes;
  };

  const submit = async () => {
    startGlobalLoader();
    try {
      await piOnSubmit(
        {
          ...album.attributes,
          images: images,
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
    } finally {
      queryClient.invalidateQueries([QueryCacheGroups.GET_ALL_ALBUMS_INFINITE]);
      stopGlobalLoader();
    }
  };

  const onSubmit = async () => {
    if (validate()) {
      const userEmails = new Set([...viewers, ...collaborators]);
      const signedUpUserCount = await ParseUser.query()
        .containedIn(ParseUser.COLUMNS.email, [...viewers, ...collaborators])
        .count();
      if (signedUpUserCount < userEmails.size) {
        openConfirm(Strings.message.nonExistentUserWarning, submit);
      } else {
        submit();
      }
    }
  };

  const onCancel = async () => {
    reinitialize();
    await piOnCancel?.();
  };

  const onAdd = (...images: ParseImage[]) => {
    setAllImages(dedupe([...images, ...allImages]));
    setRemovedImages(removedImages.filter((image) => !images.includes(image)));
  };

  const onRemove = (...images: ParseImage[]) => {
    setRemovedImages(dedupe([...removedImages, ...images]));
  };

  const onUpdate = (...images: ParseImage[]) => {
    setAllImages((prev) =>
      prev.map(
        (prevImage) =>
          images.find((image) => image.objectId === prevImage.objectId) ??
          prevImage
      )
    );
  };

  return {
    onUpdate,
    images,
    allImages,
    removedImages,
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
    isDirty,
  };
};

export default useAlbumForm;
