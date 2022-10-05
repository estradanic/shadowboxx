import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import Parse from "parse";
import { useNotificationsContext } from "./NotificationsContext";
import ErrorIcon from "@material-ui/icons/Error";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { FancyTypography, useSnackbar } from "../components";
import { Strings } from "../resources";
import { ParseImage, Image } from "../classes";
import { useGlobalLoadingContext } from "./GlobalLoadingContext";
import { isNullOrWhitespace } from "../utils";
import { ImageSelectionDialog } from "../components/Images";

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

export type PromptImageSelectionDialogProps = {
  /** Function to run when prompt is canceled */
  handleCancel?: () => Promise<void>;
  /** Function to run when selection is confirmed */
  handleConfirm?: (newValue: ParseImage[]) => Promise<void>;
  /** IImages already selected */
  alreadySelected: ParseImage[];
  /** Whether the image selection dialog allows multiple selections.
   *  Defaults to true
   */
  multiple?: boolean;
};

/** Interface defining the value of ImageContextProvider */
interface ImageContextValue {
  /** Function to upload an image */
  uploadImage: (image: Image, acl?: Parse.ACL) => Promise<ParseImage>;
  /** Function to delete image */
  deleteImage: (parseImage: ParseImage) => Promise<void>;
  /** Function to open an ImageSelectionDialog prompt */
  promptImageSelectionDialog: (props: PromptImageSelectionDialogProps) => void;
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
    "&&": {
      color: theme.palette.primary.contrastText,
      fontSize: theme.typography.h3.fontSize,
    },
  },
}));

export const ImageContextProvider = ({
  children,
}: ImageContextProviderProps) => {
  const actions = useRef<ImageAction[]>([]);
  const { addNotification } = useNotificationsContext();
  const { enqueueErrorSnackbar } = useSnackbar();

  const classes = useStyles();

  const { startGlobalLoader, stopGlobalLoader, updateGlobalLoader } =
    useGlobalLoadingContext();

  const [alreadySelected, setAlreadySelected] = useState<ParseImage[]>([]);
  const [multiple, setMultiple] = useState<boolean>(true);
  const [selectionDialogOpen, setSelectionDialogOpen] = useState(false);
  const [handleCancel, setHandleCancel] = useState<() => Promise<void>>(
    () => async () => setSelectionDialogOpen(false)
  );
  const [handleConfirm, setHandleConfirm] = useState<
    (newValue: ParseImage[]) => Promise<void>
  >(() => async (_: ParseImage[]) => setSelectionDialogOpen(false));

  const promptImageSelectionDialog = useCallback(
    ({
      handleCancel: piHandleCancel,
      handleConfirm: piHandleConfirm,
      alreadySelected,
      multiple = true,
    }: PromptImageSelectionDialogProps) => {
      setSelectionDialogOpen(true);
      setHandleCancel(() => async () => {
        setSelectionDialogOpen(false);
        await piHandleCancel?.();
      });
      setHandleConfirm(() => async (newValue: ParseImage[]) => {
        setSelectionDialogOpen(false);
        await piHandleConfirm?.(newValue);
      });
      setMultiple(multiple);
      setAlreadySelected(alreadySelected);
    },
    [
      setSelectionDialogOpen,
      setAlreadySelected,
      setHandleCancel,
      setHandleConfirm,
      setMultiple,
    ]
  );

  const recalculateProgress = () => {
    const completedActions = actions.current.filter(
      (action) => action.completed
    );
    let newProgress = (completedActions.length / actions.current.length) * 100;
    if (newProgress === 100) {
      // Allow user to see progress reach 100
      setTimeout(() => stopGlobalLoader(), 1000);
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
      progress: 5,
    });
    const action: ImageAction = { image, command: ImageActionCommand.UPLOAD };
    actions.current.push(action);

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

    if (!failed) {
      return parseImage;
    } else {
      if (isNullOrWhitespace(error.message)) {
        error.message = Strings.uploadImageError();
      }
      addNotification({
        title: Strings.uploadImageError(),
        icon: <ErrorIcon />,
      });
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
    promptImageSelectionDialog,
  };

  return (
    <ImageContext.Provider value={value}>
      <ImageSelectionDialog
        alreadySelected={alreadySelected}
        open={selectionDialogOpen}
        handleConfirm={handleConfirm}
        handleCancel={handleCancel}
        multiple={multiple}
      />
      {children}
    </ImageContext.Provider>
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
