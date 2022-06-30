import React, { useState, createContext, useContext, useRef } from "react";
import { useNotificationsContext } from "./NotificationsContext";
import { CircularProgress, useMediaQuery } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import { useSnackbar } from "../components";
import { Strings } from "../resources";
import { ParseImage, Image } from "../types";
import { useGlobalLoadingContext } from "./GlobalLoadingContext";

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
  uploadImage: (image: Image, acl?: Parse.ACL) => Promise<ParseImage>;
  /** Function to delete image */
  deleteImage: (parseImage: ParseImage) => Promise<void>;
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
  const actions = useRef<ImageAction[]>([]);
  const { addNotification } = useNotificationsContext();
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const { enqueueErrorSnackbar } = useSnackbar();

  const { setGlobalLoading } = useGlobalLoadingContext();
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  const recalculateProgress = () => {
    const completedActions = actions.current.filter(
      (action) => action.completed
    );
    const newProgress =
      (completedActions.length / actions.current.length) * 100;
    if (newProgress === 100) {
      setLoading(false);
      setGlobalLoading(false);
    }
    setProgress(newProgress);
  };

  const uploadImage = async (image: Image, acl?: Parse.ACL) => {
    setLoading(true);
    if (mobile) {
      setGlobalLoading(true);
    }

    const action: ImageAction = { image, command: ImageActionCommand.UPLOAD };
    actions.current.push(action);

    const notification = addNotification({
      title: Strings.uploadingImage(image.file.name()),
      icon: <CircularProgress />,
    });

    let failed = false;
    try {
      image.file = await image.file.save();
    } catch (e: any) {
      failed = true;
      enqueueErrorSnackbar(
        e?.message ?? Strings.uploadImageError(image.file.name())
      );
    }

    let parseImage: ParseImage = ParseImage.fromAttributes(image);
    if (acl) {
      parseImage.setACL(acl);
    }
    if (!failed) {
      try {
        parseImage = await parseImage.save();
      } catch (e: any) {
        enqueueErrorSnackbar(
          e?.message ?? Strings.uploadImageError(image.file.name())
        );
      }
    }

    action.completed = true;
    recalculateProgress();
    notification.remove();

    return parseImage;
  };

  const deleteImage = async (parseImage: ParseImage) => {
    setLoading(true);
    if (mobile) {
      setGlobalLoading(true);
    }
    const action: ImageAction = {
      image: parseImage.attributes,
      command: ImageActionCommand.DELETE,
    };
    actions.current.push(action);

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
  if (context === undefined) {
    throw new Error("No ImageContextProvider found!");
  }
  return context;
};
