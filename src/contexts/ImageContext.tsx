import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
} from "react";
import Parse from "parse";
import { readAndCompressImage } from "browser-image-resizer";
import { createFFmpeg } from "@ffmpeg/ffmpeg";
import ErrorIcon from "@material-ui/icons/Error";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import HourglassIcon from "@material-ui/icons/HourglassEmpty";
import { Strings } from "../resources";
import { ParseImage, ImageAttributes, UnpersistedParseImage } from "../classes";
import { makeValidFileName, removeExtension } from "../utils";
import { useSnackbar } from "../components/Snackbar";
import { useUserContext } from "./UserContext";
import AddImageDialog from "../components/Images/AddImageDialog";
import LinearProgress from "../components/Progress/LinearProgress";
import Typography from "../components/Typography/Typography";
import { Notification, useNotificationsContext } from "./NotificationsContext";
import { UpdateJobInfo, useJobContext } from "./JobContext";
import useRandomColor from "../hooks/useRandomColor";

export type PromptImageSelectionDialogProps = {
  /** Function to run when prompt is canceled */
  handleCancel?: () => Promise<void>;
  /** Function to run when selection is confirmed */
  handleConfirm?: (newValue: ParseImage[]) => Promise<void>;
  /** Images already selected */
  alreadySelected: ParseImage[];
  /**
   * Whether the image selection dialog allows multiple selections.
   * Defaults to true
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
    options?: {
      acl?: Parse.ACL;
      onEachCompleted?: (uploadedImage: ParseImage) => Promise<void>;
      albumId?: string;
    }
  ) => Promise<ParseImage[]>;
  /** Function to upload image from url */
  uploadImageFromUrl: (url: string, acl?: Parse.ACL) => Promise<ParseImage>;
}

/** Context to manage Images */
const ImageContext = createContext<ImageContextValue | undefined>(undefined);

/** Interface defining props for the ImageContextProvider */
interface ImageContextProviderProps {
  /** Child node */
  children: ReactNode;
}

export const ACCEPTABLE_IMAGE_EXTENSIONS = [
  "png",
  "jpg",
  "jpeg",
  "webp",
  "bmp",
];
export const ACCEPTABLE_VIDEO_EXTENSIONS = [
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
export const ACCEPTABLE_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];
export const ACCEPTABLE_VIDEO_TYPES = [
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

/** Context provider to manage Images */
export const ImageContextProvider = ({
  children,
}: ImageContextProviderProps) => {
  const variableColor = useRandomColor();
  const { addJob } = useJobContext();
  const { addNotification } = useNotificationsContext();
  const { enqueueErrorSnackbar } = useSnackbar();
  const { getLoggedInUser } = useUserContext();
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

  const uploadImage = async (
    image: ImageAttributes<"unpersisted">,
    acl?: Parse.ACL
  ) => {
    try {
      image.file = await image.file.save();
      const unpersistedParseImage = new UnpersistedParseImage(image);
      if (acl) {
        unpersistedParseImage.setACL(acl);
      }
      const parseImage = await unpersistedParseImage.save();
      return parseImage;
    } catch {
      throw new Error(Strings.error.uploadingImage(image.name));
    }
  };

  const compressImage = async (file: File) => {
    try {
      const result = await readAndCompressImage(file, {
        quality: 1,
        maxWidth: 2400,
        maxHeight: 2400,
        mimeType: "image/webp",
      });
      if (result.size > MAX_FILE_SIZE) {
        throw new Error(Strings.error.processingFile(file.name));
      }
      return new File([result], file.name, {
        type: "image/webp",
      });
    } catch {
      throw new Error(Strings.error.processingFile(file.name));
    }
  };

  const compressVideo = async (
    file: File,
    notification: Notification,
    update: UpdateJobInfo<ParseImage | undefined>
  ) => {
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
      if (!message) {
        return;
      }
      if (message.includes("Conversion failed!")) {
        success = false;
        return;
      }
      if (message.startsWith("frame=")) {
        const time = message.split("time=")[1]?.split("bitrate=")[0]?.trim();
        const [hours, minutes, seconds] = time?.split(":").map(Number) ?? [
          0, 0, 0,
        ];
        const totalSeconds =
          (hours ?? 0) * 3600 + (minutes ?? 0) * 60 + (seconds ?? 0);
        const progressPercentage = (totalSeconds / duration) * 100;
        update({ progress: progressPercentage });
        notification.update((prev) => ({
          ...prev,
          detail: (
            <LinearProgress
              color={variableColor}
              variant="determinate"
              value={progressPercentage}
            />
          ),
        }));
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
      "-movflags",
      "+faststart",
      newFileName
    );
    if (!success) {
      throw new Error(Strings.error.processingFile(file.name));
    }
    const result = ffmpeg.FS("readFile", newFileName);
    ffmpeg.exit();
    const compressedFile = new File([result.buffer], newFileName, {
      type: "video/webm",
    });
    if (compressedFile.size > MAX_FILE_SIZE) {
      throw new Error(Strings.error.fileTooLarge(file.name));
    }
    return compressedFile;
  };

  const processFile = (
    file: File,
    notification: Notification,
    update: UpdateJobInfo<ParseImage | undefined>
  ) => {
    if (ACCEPTABLE_VIDEO_TYPES.includes(file.type)) {
      return compressVideo(file, notification, update);
    }
    if (ACCEPTABLE_IMAGE_TYPES.includes(file.type)) {
      if (file.size > MAX_FILE_SIZE) {
        return compressImage(file);
      }
      return Promise.resolve(file);
    }
    throw new Error(Strings.error.invalidFileType(file.name));
  };

  const uploadFile = (file: File, acl?: Parse.ACL) => {
    const fileName = makeValidFileName(file.name);
    const parseFile = new Parse.File(fileName, file);
    let type: ImageAttributes["type"] = ACCEPTABLE_VIDEO_TYPES.includes(
      file.type
    )
      ? "video"
      : "image";
    if (file.type === "image/gif") {
      type = "gif";
    }
    return uploadImage(
      {
        file: parseFile,
        owner: getLoggedInUser().toPointer(),
        name: removeExtension(fileName),
        type,
      },
      acl
    );
  };

  const processAndUploadFile = async (
    file: File,
    notification: Notification,
    update: UpdateJobInfo<ParseImage | undefined>,
    acl?: Parse.ACL
  ) => {
    const processedFile = await processFile(file, notification, update);
    update({ progress: 100 });
    notification.update((prev) => ({
      ...prev,
      title: Strings.message.uploading(file.name),
      icon: <CloudUploadIcon />,
      detail: <LinearProgress color={variableColor} variant="indeterminate" />,
    }));
    const parseFile = await uploadFile(processedFile, acl);
    return parseFile;
  };

  const uploadImagesFromFiles = (
    files: File[],
    options: {
      acl?: Parse.ACL;
      onEachCompleted?: (uploadedImage: ParseImage) => Promise<void>;
      albumId?: string;
    } = {}
  ) => {
    return new Promise<ParseImage[]>((resolve, reject) => {
      // Using setTimeout to prevent the loader from not showing up
      setTimeout(async () => {
        try {
          const promises: Promise<ParseImage | void>[] = [];
          for (const file of files) {
            const notification = addNotification({
              id: `process-${file.name}`,
              title: Strings.message.processing(file.name),
              icon: <HourglassIcon />,
              removeable: false,
              detail: (
                <LinearProgress color={variableColor} variant="indeterminate" />
              ),
            });
            const { result } = addJob<ParseImage | undefined>(
              (update) => async () => {
                try {
                  const uploadedImage = await processAndUploadFile(
                    file,
                    notification,
                    update,
                    options.acl
                  );
                  notification.update((prev) => ({
                    ...prev,
                    title: Strings.message.uploaded(file.name),
                    icon: <CloudUploadIcon />,
                    removeable: true,
                    detail: undefined,
                  }));
                  await options.onEachCompleted?.(uploadedImage);
                  return uploadedImage;
                } catch (error: unknown) {
                  console.error(error);
                  const message =
                    error &&
                    typeof error === "object" &&
                    "message" in error &&
                    error.message?.toString()
                      ? error.message.toString()
                      : Strings.error.common;
                  notification.update((prev) => ({
                    ...prev,
                    title: Strings.error.uploadingImage(file.name),
                    icon: <ErrorIcon />,
                    removeable: true,
                    detail: <Typography>{message}</Typography>,
                  }));
                  return undefined;
                }
              },
              options.albumId ? { albumId: options.albumId, file } : undefined
            );
            promises.push(result);
          }
          const results = await Promise.all(promises);
          const uploadedImages: ParseImage[] = [];
          for (const result of results) {
            if (result) {
              uploadedImages.push(result);
            }
          }
          resolve(uploadedImages);
        } catch (error: any) {
          reject(error?.message);
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
    try {
      await parseImage.destroy();
    } catch (e: any) {
      console.error(e);
      enqueueErrorSnackbar(Strings.error.deletingImage(parseImage.name));
    }
  };

  const value: ImageContextValue = {
    deleteImage,
    promptImageSelectionDialog,
    uploadImagesFromFiles,
    uploadImageFromUrl,
  };

  return (
    <ImageContext.Provider value={value}>
      <AddImageDialog
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
