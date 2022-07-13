import React, { createContext, useContext, useRef } from "react";
import { useNotificationsContext } from "./NotificationsContext";
import { CircularProgress } from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { FancyTypography, useSnackbar } from "../components";
import { Strings } from "../resources";
import { ParseImage, Image } from "../types";
import { useGlobalLoadingContext } from "./GlobalLoadingContext";
import { isNullOrWhitespace } from "../utils";

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
    startGlobalLoader,
    stopGlobalLoader,
    updateGlobalLoader,
  } = useGlobalLoadingContext();

  const recalculateProgress = () => {
    const completedActions = actions.current.filter(
      (action) => action.completed
    );
    let newProgress = (completedActions.length / actions.current.length) * 100;
    if (newProgress === 100) {
      stopGlobalLoader();
    } else if (newProgress === 0) {
      newProgress = 5;
    }
    updateGlobalLoader({ progress: newProgress });
  };

  const uploadImage = async (image: Image, acl?: Parse.ACL) => {
    startGlobalLoader({
      type: "determinate",
      content: (
        <FancyTypography className={classes.uploadingImages}>
          {Strings.uploadingImages()}
        </FancyTypography>
      ),
    });
    const action: ImageAction = { image, command: ImageActionCommand.UPLOAD };
    actions.current.push(action);

    const notification = addNotification({
      title: Strings.uploadingImage(image.name),
      icon: <CircularProgress />,
    });

    let failed = false;
    let error = null;
    try {
      image.file = await image.file.save();
    } catch (e: any) {
      failed = true;
      error = e;
    }

    let parseImage: ParseImage = ParseImage.fromAttributes(image);
    if (acl) {
      parseImage.setACL(acl);
    }
    if (!failed) {
      try {
        parseImage = await parseImage.save();
      } catch (e: any) {
        failed = true;
        error = e;
      }
    }

    action.completed = true;
    recalculateProgress();
    notification.remove();

    if (!failed) {
      return parseImage;
    } else {
      if (isNullOrWhitespace(error.message)) {
        error.message = Strings.uploadImageError();
      }
      throw error;
    }
  };

  const deleteImage = async (parseImage: ParseImage) => {
    startGlobalLoader();
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
