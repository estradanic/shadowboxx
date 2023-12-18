import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import PQueue from "p-queue";
import useRefState from "../hooks/useRefState";

/** Sparse definition of information associated with a job */
export interface JobInfo<T> extends Record<string, any> {
  imageId?: string;
  albumId?: string;
  progress?: number;
  file?: File;
  jobId?: string;
  onComplete?: JobOnComplete<T>;
  update?: UpdateJobInfo<T>;
}

export type UpdateJobInfo<T> = (
  newInfo: Omit<JobInfo<T>, "jobId" | "update">
) => void;
export type JobOnComplete<T> = (
  result: T | void,
  info: JobInfo<T>
) => void | Promise<void>;

export interface Job<T> {
  /** Result of the job, if it has finished */
  result: Promise<T | void>;
  /** Updates the job information */
  update: UpdateJobInfo<T>;
}

export interface JobContextValue {
  /** Number of currently running jobs */
  jobCount: number;
  /** Adds a job to the queue. Returns a promise that resolves when the job is done. */
  addJob: <T>(
    fn: (update: UpdateJobInfo<T>) => () => Promise<T>,
    info?: Omit<JobInfo<T>, "jobId" | "update">
  ) => Job<T>;
  /** List of information associated with each job */
  jobInfo: Record<string, JobInfo<any>>;
}

export interface JobContextProviderProps {
  children: ReactNode;
}

const MAX_CURRENT_JOBS = 4 as const;

const JobContext = createContext<JobContextValue | undefined>(undefined);

/** Provides a context that allows adding jobs to a queue. */
export const JobContextProvider = ({ children }: JobContextProviderProps) => {
  const promiseQueue = new PQueue({ concurrency: MAX_CURRENT_JOBS });
  const [jobCount, setJobCount] = useState(0);
  const [jobInfoRef, jobInfo, setJobInfo] = useRefState<
    Record<string, JobInfo<any>>
  >({});
  const wakeLockRef = useRef<WakeLockSentinel>();

  useEffect(() => {
    if (!("wakeLock" in navigator)) {
      return;
    }
    if (jobCount && !wakeLockRef.current) {
      navigator.wakeLock
        .request("screen")
        .then((wakeLock) => {
          wakeLockRef.current = wakeLock;
        })
        .catch((e) => {
          console.error(e);
        });
    } else if (!jobCount && wakeLockRef.current) {
      wakeLockRef.current.release().then(() => {
        wakeLockRef.current = undefined;
      });
    }
  }, [jobCount]);

  function addJob<T>(
    fn: (update: UpdateJobInfo<T>) => () => Promise<T>,
    info?: Omit<JobInfo<T>, "jobId" | "update">
  ) {
    const jobId = Math.random().toString(36).substring(2, 9);
    if (info) {
      setJobInfo((prev) => ({ ...prev, [jobId]: info }));
    }
    const update = (newInfo: Omit<JobInfo<T>, "jobId" | "update">) => {
      setJobInfo((prev) => {
        const oldInfo = prev[jobId] || {};
        return { ...prev, [jobId]: { ...oldInfo, ...newInfo, update } };
      });
    };
    setJobCount((prev) => prev + 1);
    let result = promiseQueue.add<T>(fn(update));
    result
      .then(async (awaitedResult) => {
        console.log("Got result");
        const onComplete = jobInfoRef.current[jobId]?.onComplete;
        if (onComplete) {
          console.log("Got onComplete");
          await onComplete(awaitedResult, { ...info, jobId, update });
        }
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        if (info) {
          setJobInfo((prev) => {
            const newInfo = { ...prev };
            delete newInfo[jobId];
            return newInfo;
          });
        }
        setJobCount((prev) => prev - 1);
        console.log("finally");
      });
    return { result, update };
  }

  const value: JobContextValue = {
    jobCount,
    addJob,
    jobInfo,
  };

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
};

export const useJobContext = () => {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error("useJobContext must be used within a JobContextProvider");
  }
  return context;
};
