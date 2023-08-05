import { ParseImage } from "../../classes";
import {
  useNotificationsContext,
  NotificationType,
} from "../../contexts/NotificationsContext";
import { CircularProgress } from "@material-ui/core";

export enum JobType {
  Processing = "Processing",
  Uploading = "Uploading",
  Encrypting = "Encrypting",
}

interface BaseJob<TData = any> {
  type: JobType;
  id: string;
  promise: Promise<TData>;
  progress: number;
  status: "success" | "error" | "pending";
}

export interface ProcessingJob extends BaseJob<File> {
  type: JobType.Processing;
}

export interface UploadingJob extends BaseJob<ParseImage | undefined> {
  type: JobType.Uploading;
}

export interface EncryptingJob extends BaseJob<File> {
  type: JobType.Encrypting;
}

export type Job<TType extends JobType> = TType extends JobType.Processing
  ? ProcessingJob
  : TType extends JobType.Uploading
  ? UploadingJob
  : TType extends JobType.Encrypting
  ? EncryptingJob
  : never;

export interface UseJobNotificationsReturn {
  addJob: <TType extends JobType>(job: Job<TType>) => Job<TType>;
  removeJob: (id: string) => void;
  updateJob: <TType extends JobType>(
    id: string,
    updates: Partial<Omit<Job<TType>, "id">>
  ) => Promise<Job<TType> | undefined>;
  getJob: <TType extends JobType>(
    id: string,
    type: TType
  ) => Job<TType> | undefined;
  getJobs: <TType extends JobType>(type: TType) => Job<TType>[];
}

const useJobNotifications = (): UseJobNotificationsReturn => {
  const { addNotification, notifications } = useNotificationsContext();

  const addJob = <TType extends JobType>(job: Job<TType>) => {
    addNotification({
      id: job.id,
      title: "placeholder",
      icon: <CircularProgress size="small" />,
      type: NotificationType.Job,
      data: {
        promise: job.promise,
        progress: job.progress,
        type: job.type,
        status: job.status,
      },
      // detail: TODO
    });
    return job;
  };

  const removeJob = (id: string) => {
    notifications[id]?.remove();
  };

  const updateJob = async <TType extends JobType>(
    id: string,
    updates: Partial<Omit<Job<TType>, "id">>
  ) => {
    const notification = notifications[id];
    if (!notification) return undefined;
    const newNotification = await notification.update?.((prev) => ({
      ...prev,
      ...updates,
    }));
    if (!newNotification) return undefined;
    const job = notification.data as Omit<Job<TType>, "id">;
    return { id, ...job } as Job<TType>;
  };

  const getJob = <TType extends JobType>(id: string, type: TType) => {
    const notification = notifications[id];
    if (!notification) return undefined;
    const job = notification.data as Omit<Job<TType>, "id">;
    return { id, ...job } as Job<TType>;
  };

  const getJobs = <TType extends JobType>(type: TType) => {
    return Object.values(notifications)
      .filter((notification) => {
        if (notification.type !== NotificationType.Job) return false;
        const job = notification.data as Job<TType>;
        return job.type === type;
      })
      .map((notification) => {
        const job = notification.data as Omit<Job<TType>, "id">;
        return { id: notification.id, ...job } as Job<TType>;
      });
  };

  return {
    addJob,
    removeJob,
    updateJob,
    getJob,
    getJobs,
  };
};

export default useJobNotifications;
