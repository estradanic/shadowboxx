import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import PQueue from "p-queue";

/** Sparse definition of information associated with a job */
export interface JobInfo extends Record<string, any> {
  albumId?: string;
  progress?: number;
}

export type UpdateJobInfo = (newInfo: Omit<JobInfo, "jobId">) => void;

export interface Job<T> {
  /** Result of the job, if it has finished */
  result: Promise<T | void>;
  /** Updates the job information */
  update: UpdateJobInfo;
}

export interface JobContextValue {
  /** Number of currently running jobs */
  jobCount: number;
  /** Adds a job to the queue. Returns a promise that resolves when the job is done. */
  addJob: <T>(fn: (update: UpdateJobInfo) => () => Promise<T>, info?: JobInfo) => Job<T>;
  /** List of information associated with each job */
  jobInfo: Record<string, JobInfo>;
}

export interface JobContextProviderProps {
  children: React.ReactNode;
}

const MAX_CURRENT_JOBS = 4 as const;

const JobContext = createContext<JobContextValue | undefined>(undefined);

/** Provides a context that allows adding jobs to a queue. */
export const JobContextProvider = ({ children }: JobContextProviderProps) => {
  const promiseQueue = new PQueue({ concurrency: MAX_CURRENT_JOBS });
  const [jobCount, setJobCount] = useState(0);
  const [jobInfo, setJobInfo] = useState<Record<string, JobInfo>>({});
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

  function addJob<T>(fn: (update: UpdateJobInfo) => () => Promise<T>, info?: JobInfo) {
    const jobId = Math.random().toString(36).substring(2, 9);
    if (info) {
      setJobInfo((prev) => ({...prev, [jobId]: info}));
    }
    const update = (newInfo: Omit<JobInfo, "jobId">) => {
      setJobInfo((prev) => ({...prev, [jobId]: {...newInfo}}));
    };
    setJobCount((prev) => prev + 1);
    let result: Promise<T | void>;
    try {
      result = promiseQueue.add<T>(fn(update));
    } catch (e) {
      throw e;
    } finally {
      if (info) {
        setJobInfo((prev) => {
          const newInfo = {...prev};
          delete newInfo[jobId];
          return newInfo;
        });
      }
      setJobCount((prev) => prev - 1);
    }
    return {result, update};
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
