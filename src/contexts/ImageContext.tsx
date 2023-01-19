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
import { FancyTypography, useSnackbar } from "../components";
import { Strings } from "../resources";
import { ParseImage, ImageAttributes } from "../classes";
import { useGlobalLoadingStore } from "../stores";
import {
  isNullOrWhitespace,
  makeValidFileName,
  removeExtension,
} from "../utils";
import { ImageSelectionDialog } from "../components/Images";
import { readAndCompressImage } from "browser-image-resizer";
import { useUserContext } from "./UserContext";
import { UnpersistedParseImage } from "../classes/ParseImage";

export enum ImageActionCommand {
  DELETE,
  UPLOAD,
}

/** Interface defining an action being done to an image */
export interface ImageAction {
  /** The image being worked on */
  image: ImageAttributes;
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
  /** Function to delete image */
  deleteImage: (parseImage: ParseImage) => Promise<void>;
  /** Function to open an ImageSelectionDialog prompt */
  promptImageSelectionDialog: (props: PromptImageSelectionDialogProps) => void;
  /** Function to upload images from files */
  uploadImagesFromFiles: (
    files: File[],
    acl?: Parse.ACL
  ) => Promise<ParseImage[]>;
  /** Function to upload image from url */
  uploadImageFromUrl: (url: string, acl?: Parse.ACL) => Promise<ParseImage>;
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
  const { enqueueErrorSnackbar } = useSnackbar();

  const { getLoggedInUser } = useUserContext();

  const { startGlobalLoader, stopGlobalLoader, updateGlobalLoader } =
    useGlobalLoadingStore((state) => ({
      startGlobalLoader: state.startGlobalLoader,
      stopGlobalLoader: state.stopGlobalLoader,
      updateGlobalLoader: state.updateGlobalLoader,
    }));

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

  const uploadImage = async (
    image: ImageAttributes,
    acl?: Parse.ACL
  ): Promise<ParseImage | undefined> => {
    startGlobalLoader({
      type: "determinate",
      content: (
        <FancyTypography variant="loading">
          {Strings.uploadingImages()}
        </FancyTypography>
      ),
      progress: 5,
    });
    const action: ImageAction = { image, command: ImageActionCommand.UPLOAD };
    actions.current.push(action);

    try {
      image.file = await image.file.save();
      const unpersistedParseImage = new UnpersistedParseImage(image);
      if (acl) {
        unpersistedParseImage.setACL(acl);
      }
      const parseImage = await unpersistedParseImage.save();
      action.completed = true;
      recalculateProgress();
      return parseImage;
    } catch (error: any) {
      action.completed = true;
      recalculateProgress();
      if (isNullOrWhitespace(error.message)) {
        error.message = Strings.uploadImageError();
      }
      addNotification({
        id: `upload-image-error-${image.name}`,
        title: Strings.uploadImageError(),
        icon: <ErrorIcon />,
      });
      console.error(error);
      enqueueErrorSnackbar(Strings.uploadImageError());
      return undefined;
    }
  };

  const processFiles = async (eventFiles: File[]) => {
    const files: File[] = [];
    for (let i = 0; i < eventFiles.length; i++) {
      files[i] = eventFiles[i];
    }
    const max = multiple ? files.length : 1;
    const resizeImagePromises: Promise<File>[] = [];
    for (let i = 0; i < max; i++) {
      let file = files[i];
      if (file.size > 15000000) {
        resizeImagePromises.push(
          readAndCompressImage(file, {
            quality: 1,
            maxWidth: 2400,
            maxHeight: 2400,
            mimeType: "image/webp",
          })
        );
      } else {
        resizeImagePromises.push(Promise.resolve(file));
      }
    }
    return await Promise.all(resizeImagePromises);
  };

  const uploadFiles = async (files: File[], acl?: Parse.ACL) => {
    const max = multiple ? files.length : 1;
    const newImagePromises: Promise<ParseImage | undefined>[] = [];
    for (let i = 0; i < max; i++) {
      let file = files[i];
      const fileName = makeValidFileName(files[i].name);
      const parseFile = new Parse.File(fileName, file);
      newImagePromises.push(
        uploadImage(
          {
            file: parseFile,
            owner: getLoggedInUser().toPointer(),
            name: removeExtension(fileName),
          },
          acl
        )
      );
    }
    return Promise.allSettled(newImagePromises);
  };

  const uploadImagesFromFiles = async (files: File[], acl?: Parse.ACL) => {
    startGlobalLoader({
      type: "determinate",
      content: (
        <FancyTypography variant="loading">
          {Strings.processingImages()}
        </FancyTypography>
      ),
    });
    return new Promise<ParseImage[]>((resolve, reject) => {
      // Using setTimeout to prevent the loader from not showing up
      setTimeout(async () => {
        const processedFiles = await processFiles(files);
        try {
          const result = await uploadFiles(processedFiles, acl);
          const newImages: ParseImage[] = [];
          for (const promise of result) {
            if (promise.status === "fulfilled" && promise.value) {
              newImages.push(promise.value);
            }
          }
          resolve(newImages);
        } catch (error: any) {
          reject(error?.message);
        } finally {
          stopGlobalLoader();
        }
      }, 10);
    });
  };

  const uploadImageFromUrl = async (url: string, acl?: Parse.ACL) => {
    const fileName = makeValidFileName(url.substring(url.lastIndexOf("/") + 1));
    const parseFile = new Parse.File(fileName, { uri: url });
    const newImage = await uploadImage(
      {
        file: parseFile,
        owner: getLoggedInUser().toPointer(),
        name: removeExtension(fileName),
      },
      acl
    );
    if (!newImage) {
      throw new Error(Strings.uploadImageError());
    }
    return newImage;
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
    deleteImage,
    promptImageSelectionDialog,
    uploadImagesFromFiles,
    uploadImageFromUrl,
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
