import React, { createContext, useContext, useRef } from "react";
import { useNotificationsContext } from "./NotificationsContext";
import { CircularProgress } from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { FancyTypography, useSnackbar } from "../components";
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

const useStyles = makeStyles((theme: Theme) => ({
  uploadingImages: {
    color: theme.palette.primary.contrastText,
    fontSize: theme.typography.h3.fontSize,
  },
}));

export const ImageContextProvider = ({
  children,
}: ImageContextProviderProps) => {
  const actions = useRef<ImageAction[]>([]);
  const { addNotification } = useNotificationsContext();
  const { enqueueErrorSnackbar } = useSnackbar();

  const classes = useStyles();

  const {
    setGlobalLoading,
    setGlobalLoaderType,
    setGlobalProgress,
    setGlobalLoaderContent,
    resetGlobalLoader,
  } = useGlobalLoadingContext();

  const recalculateProgress = () => {
    const completedActions = actions.current.filter(
      (action) => action.completed
    );
    let newProgress = (completedActions.length / actions.current.length) * 100;
    if (newProgress === 100) {
      resetGlobalLoader();
    } else if (newProgress === 0) {
      newProgress = 5;
    }
    setGlobalProgress(newProgress);
  };

  const uploadImage = async (image: Image, acl?: Parse.ACL) => {
    setGlobalLoaderType("determinate");
    setGlobalLoaderContent(
      <FancyTypography className={classes.uploadingImages}>
        {Strings.uploadingImages()}
      </FancyTypography>
    );
    setGlobalLoading(true);

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
    setGlobalLoading(true);
    setGlobalLoaderType("determinate");
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
