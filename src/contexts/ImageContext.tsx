import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import Parse from "parse";
import { readAndCompressImage } from "browser-image-resizer";
import ErrorIcon from "@material-ui/icons/Error";
import { createFFmpeg } from "@ffmpeg/ffmpeg";
import { Strings } from "../resources";
import {
  ParseImage,
  ImageAttributes,
  UnpersistedParseImage,
  UnpersistedParseImageAttributes,
} from "../classes";
import { useGlobalLoadingStore } from "../stores";
import {
  isNullOrWhitespace,
  makeValidFileName,
  removeExtension,
} from "../utils";
import { FancyTypography } from "../components/Typography";
import { useSnackbar } from "../components/Snackbar";
import { useUserContext } from "./UserContext";
import ImageSelectionDialog from "../components/Images/ImageSelectionDialog";
import { useNotificationsContext } from "./NotificationsContext";
import Typography from "@material-ui/core/Typography";

export enum ImageActionCommand {
  DELETE,
  UPLOAD,
  PROCESS,
}

/** Interface defining an action being done to an image */
export interface ImageAction {
  /** The command being performed on the image */
  command: ImageActionCommand;
  /** Whether action is completed */
  completed?: boolean;
  /** Fractional progress (0-1) of the action */
  progress?: number;
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

const ACCEPTABLE_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "bmp"];
const ACCEPTABLE_VIDEO_EXTENSIONS = [
  "mp4",
  "avi",
  "flv",
  "webm",
  "m4v",
  "mpg",
  "ogg",
  "mkv",
  "gif",
];
const ACCEPTABLE_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];
const ACCEPTABLE_VIDEO_TYPES = [
  "video/mp4",
  "video/x-msvideo",
  "video/x-flv",
  "video/webm",
  "video/x-m4v",
  "video/mpeg",
  "video/ogg",
  "video/x-matroska",
  "image/gif",
];
const MAX_FILE_SIZE = 20000000; // 20 MB

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
    let totalProgress = 0;
    actions.current.forEach((a) => (totalProgress += a.progress ?? 0));
    let newProgress = (totalProgress / actions.current.length) * 100;
    if (newProgress === 100) {
      // Allow user to see progress reach 100
      setTimeout(() => stopGlobalLoader(), 1000);
    } else if (newProgress === 0) {
      newProgress = 5;
    }
    updateGlobalLoader({ progress: newProgress });
  };

  const uploadImage = async (
    image: UnpersistedParseImageAttributes,
    acl?: Parse.ACL
  ): Promise<ParseImage | undefined> => {
    startGlobalLoader({
      type: "determinate",
      content: (
        <FancyTypography variant="loading">
          {Strings.message.uploadingImages}
        </FancyTypography>
      ),
      progress: 5,
    });
    const action: ImageAction = { command: ImageActionCommand.UPLOAD };
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
        error.message = Strings.error.uploadingImage(image.name);
      }
      addNotification({
        id: `upload-image-error-${image.name}`,
        title: Strings.error.uploadingImage(image.name),
        icon: <ErrorIcon />,
      });
      console.error(error);
      enqueueErrorSnackbar(Strings.error.uploadingImage(image.name));
      return undefined;
    }
  };

  const compressImage = (file: File, actionIndex: number): Promise<File> => {
    return readAndCompressImage(file, {
      quality: 1,
      maxWidth: 2400,
      maxHeight: 2400,
      mimeType: "image/webp",
    }).then((c) => {
      actions.current[actionIndex].progress = 1;
      actions.current[actionIndex].completed = true;
      return c;
    });
  };

  const compressVideo = async (
    file: File,
    actionIndex: number
  ): Promise<File> => {
    const videoEl = document.createElement("video");
    videoEl.preload = "metadata";
    let duration = Number.MAX_SAFE_INTEGER;
    videoEl.onloadedmetadata = () => {
      window.URL.revokeObjectURL(videoEl.src);
      duration = videoEl.duration;
    };
    videoEl.src = URL.createObjectURL(file);
    const ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();
    let success = true;
    ffmpeg.setLogger(({ message }) => {
      if (message.includes("Conversion failed!")) {
        success = false;
        return;
      }
      if (message.startsWith("frame=")) {
        const time = message.split("time=")[1].split("bitrate=")[0].trim();
        const [hours, minutes, seconds] = time.split(":").map(Number);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        actions.current[actionIndex].progress = totalSeconds / duration;
        let progress =
          (actions.current.reduce((a, b) => a + (b.progress ?? 0), 0) /
            actions.current.length) *
          100;
        if (progress < 5) {
          progress = 5;
        }
        updateGlobalLoader({ progress });
      }
    });
    const dataArray = new Uint8Array(await file.arrayBuffer());
    ffmpeg.FS("writeFile", file.name, dataArray);
    const newFileName = removeExtension(file.name) + "_compressed.mp4";
    await ffmpeg.run(
      "-i",
      file.name,
      "-f",
      "webm",
      "-vcodec",
      "libvpx-vp9",
      "-acodec",
      "libvorbis",
      "-vf",
      "scale='min(720,iw)':'min(1080,ih)':'force_original_aspect_ratio=decrease',pad='width=ceil(iw/2)*2:height=ceil(ih/2)*2'",
      "-pix_fmt",
      "yuv420p",
      "-preset",
      "faster",
      newFileName
    );
    if (!success) {
      throw new Error("Video compression failed");
    }
    const result = ffmpeg.FS("readFile", newFileName);
    return new File([result.buffer], newFileName, {
      type: "video/mp4",
    });
  };

  const processFiles = async (eventFiles: File[]) => {
    const files: File[] = [];
    for (let i = 0; i < eventFiles.length; i++) {
      files[i] = eventFiles[i];
    }
    const max = multiple ? files.length : 1;
    const resizeImagePromises: Promise<File>[] = [];
    for (let i = 0; i < max; i++) {
      const actionIndex =
        actions.current.push({ command: ImageActionCommand.PROCESS }) - 1;
      let file = files[i];
      if (ACCEPTABLE_VIDEO_TYPES.includes(file.type)) {
        resizeImagePromises.push(compressVideo(file, actionIndex));
      } else if (ACCEPTABLE_IMAGE_TYPES.includes(file.type)) {
        if (file.size > MAX_FILE_SIZE) {
          resizeImagePromises.push(compressImage(file, actionIndex));
        } else {
          resizeImagePromises.push(Promise.resolve(file));
        }
      } else {
        enqueueErrorSnackbar(Strings.error.invalidFileType(file.name));
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
      let type: ImageAttributes["type"] = ACCEPTABLE_VIDEO_TYPES.includes(
        file.type
      )
        ? "video"
        : "image";
      if (file.type === "image/gif") {
        type = "gif";
      }
      newImagePromises.push(
        uploadImage(
          {
            file: parseFile,
            owner: getLoggedInUser().toPointer(),
            name: removeExtension(fileName),
            type,
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
        <>
          <FancyTypography variant="loading">
            {Strings.message.processingImages}
          </FancyTypography>
          <Typography>{Strings.message.processingImagesDetail}</Typography>
        </>
      ),
    });
    return new Promise<ParseImage[]>((resolve, reject) => {
      // Using setTimeout to prevent the loader from not showing up
      setTimeout(async () => {
        try {
          const processedFiles = await processFiles(files);
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
    if (!url) {
      throw new Error(Strings.prompt.pleaseEnterA("URL"));
    }
    let type: ImageAttributes["type"] = "image";
    const extension = url.substring(url.lastIndexOf(".") + 1).toLowerCase();
    if (extension === "gif") {
      type = "gif";
    } else if (ACCEPTABLE_VIDEO_EXTENSIONS.includes(extension)) {
      type = "video";
    } else if (!ACCEPTABLE_IMAGE_EXTENSIONS.includes(extension)) {
      enqueueErrorSnackbar(Strings.error.invalidFileType(url));
      throw new Error(Strings.error.invalidFileType(url));
    }
    const fileName = makeValidFileName(url.substring(url.lastIndexOf("/") + 1));
    const parseFile = new Parse.File(fileName, { uri: url });
    const newImage = await uploadImage(
      {
        file: parseFile,
        owner: getLoggedInUser().toPointer(),
        name: removeExtension(fileName),
        type,
      },
      acl
    );
    if (!newImage) {
      throw new Error(Strings.error.uploadingImage(fileName));
    }
    return newImage;
  };

  const deleteImage = async (parseImage: ParseImage) => {
    startGlobalLoader();
    const action: ImageAction = { command: ImageActionCommand.DELETE };
    actions.current.push(action);

    try {
      await parseImage.destroy();
    } catch (e: any) {
      console.error(e);
      enqueueErrorSnackbar(Strings.error.deletingImage(parseImage.name));
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
