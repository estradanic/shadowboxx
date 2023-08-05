import React, { createContext, useCallback, useContext, useState } from "react";
import Parse from "parse";
import { readAndCompressImage } from "browser-image-resizer";
import { createFFmpeg } from "@ffmpeg/ffmpeg";
import { Strings } from "../resources";
import {
  ParseImage,
  ImageAttributes,
  UnpersistedParseImage,
  UnpersistedParseImageAttributes,
} from "../classes";
import {
  isNullOrWhitespace,
  makeValidFileName,
  removeExtension,
} from "../utils";
import { useSnackbar } from "../components/Snackbar";
import { useUserContext } from "./UserContext";
import ImageSelectionDialog from "../components/Images/ImageSelectionDialog";
import { useJobNotifications } from "../hooks/Notifications";
import { JobType } from "../hooks/Notifications/useJobNotifications";
import { useGlobalLoadingStore } from "../stores";

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
  const { enqueueErrorSnackbar } = useSnackbar();
  const { getLoggedInUser } = useUserContext();
  const { addJob, updateJob } = useJobNotifications();
  const { startGlobalLoader, stopGlobalLoader } = useGlobalLoadingStore(
    (state) => ({
      startGlobalLoader: state.startGlobalLoader,
      stopGlobalLoader: state.stopGlobalLoader,
    })
  );
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

  const uploadImage = (
    image: UnpersistedParseImageAttributes,
    acl?: Parse.ACL
  ): Promise<ParseImage | undefined> => {
    const jobId = `upload-${image.name}`;
    const job = addJob<JobType.Uploading>({
      id: jobId,
      progress: 0,
      type: JobType.Uploading,
      status: "pending",
      promise: new Promise<ParseImage | undefined>(async (resolve) => {
        try {
          image.file = await image.file.save();
          const unpersistedParseImage = new UnpersistedParseImage(image);
          if (acl) {
            unpersistedParseImage.setACL(acl);
          }
          const parseImage = await unpersistedParseImage.save();
          await updateJob(jobId, { progress: 1, status: "success" });
          resolve(parseImage);
        } catch (error: any) {
          updateJob(jobId, { progress: 1 });
          if (isNullOrWhitespace(error.message)) {
            error.message = Strings.error.uploadingImage(image.name);
          }
          await updateJob(jobId, { status: "error", progress: 1 });
          console.error(error);
          enqueueErrorSnackbar(Strings.error.uploadingImage(image.name));
          resolve(undefined);
        }
      }),
    });
    return job.promise;
  };

  const compressImage = async (file: File, jobId: string): Promise<File> => {
    const result = await readAndCompressImage(file, {
      quality: 1,
      maxWidth: 2400,
      maxHeight: 2400,
      mimeType: "image/webp",
    });
    await updateJob(jobId, { progress: 1, status: "success" });
    return result;
  };

  const compressVideo = async (file: File, jobId: string): Promise<File> => {
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
        updateJob(jobId, { progress: totalSeconds / duration });
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
      const jobId = `process-${files[i].name}`;
      const job = addJob<JobType.Processing>({
        id: jobId,
        progress: 0,
        type: JobType.Processing,
        status: "pending",
        promise: new Promise<File>(async (resolve, reject) => {
          if (ACCEPTABLE_VIDEO_TYPES.includes(files[i].type)) {
            resolve(await compressVideo(files[i], jobId));
          } else if (ACCEPTABLE_IMAGE_TYPES.includes(files[i].type)) {
            if (files[i].size > MAX_FILE_SIZE) {
              resolve(await compressImage(files[i], jobId));
            } else {
              resolve(files[i]);
            }
          } else {
            reject(Strings.error.invalidFileType(files[i].name));
          }
        }),
      });
      resizeImagePromises.push(job.promise);
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

  const uploadImagesFromFiles = (files: File[], acl?: Parse.ACL) => {
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
    try {
      await parseImage.destroy();
    } catch (e: any) {
      console.error(e);
      enqueueErrorSnackbar(Strings.error.deletingImage(parseImage.name));
    } finally {
      stopGlobalLoader();
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
