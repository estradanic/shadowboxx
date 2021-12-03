import React, { useState, createContext, useContext, useCallback } from "react";
import Parse from "parse";
import { useNotificationsContext } from "./NotificationsContext";
import Strings from "../resources/Strings";
import { CircularProgress } from "@material-ui/core";
import { useSnackbar } from "../components";
import Image from "../types/Image";

export enum ImageActionCommand {
  DELETE,
  UPLOAD,
}

/** Interface defining an action being done to an image */
export interface ImageAction {
  /** The image being worked on */
  image: Image;
  /** The command being performed on the image */
  command: ImageActionCommand;
  /** Whether action is completed or not */
  completed?: boolean;
}

/** Interface defining the value of ImageContextProvider */
interface ImageContextValue {
  /** Whether there are actions currently in progress or not */
  loading: boolean;
  /** A completion value for Progress components */
  progress: number;
  /** Function to upload an image */
  uploadImage: (image: Image) => Promise<Parse.Object<Image>>;
  /** Function to delete image */
  deleteImage: (parseImage: Parse.Object<Image>) => Promise<void>;
}

/** Context to manage Images */
const ImageContext = createContext<ImageContextValue | undefined>(undefined);

/** Interface defining props for the ImageContextProvider */
interface ImageContextProviderProps {
  /** Child node */
  children: React.ReactNode;
}

export const ImageContextProvider = ({
  children,
}: ImageContextProviderProps) => {
  const [actions, setActions] = useState<ImageAction[]>([]);
  const { addNotification } = useNotificationsContext();
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const { enqueueErrorSnackbar } = useSnackbar();

  const recalculateProgress = useCallback(() => {
    const completedActions = actions.filter((action) => action.completed);
    const newProgress = (completedActions.length / actions.length) * 100;
    if (newProgress === 100) {
      setLoading(false);
    }
    setProgress(newProgress);
  }, [actions]);

  const uploadImage = async (image: Image) => {
    setLoading(true);
    let parseImage: Parse.Object<Image> = new Parse.Object("Image", image);

    const action: ImageAction = { image, command: ImageActionCommand.UPLOAD };
    setActions((prev) => [...prev, action]);

    const notification = addNotification({
      title: Strings.uploadingImage(image.file.name()),
      icon: <CircularProgress />,
    });

    try {
      parseImage = await parseImage.save();
    } catch (e: any) {
      enqueueErrorSnackbar(
        e?.message ?? Strings.uploadImageError(image.file.name())
      );
    }

    action.completed = true;
    recalculateProgress();
    notification.remove();

    return parseImage;
  };

  const deleteImage = async (parseImage: Parse.Object<Image>) => {
    setLoading(true);
    const action: ImageAction = {
      image: parseImage.attributes,
      command: ImageActionCommand.DELETE,
    };
    setActions((prev) => [...prev, action]);

    try {
      await parseImage.destroy();
    } catch (e: any) {
      enqueueErrorSnackbar(e?.message ?? Strings.commonError());
    }

    action.completed = true;
    recalculateProgress();
  };

  const value: ImageContextValue = {
    uploadImage,
    deleteImage,
    progress,
    loading,
  };

  return (
    <ImageContext.Provider value={value}>{children}</ImageContext.Provider>
  );
};

/** Alias to useContext(ImageContext) */
export const useImageContext = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error("No ImageContextProvider!");
  }
  return context;
};
