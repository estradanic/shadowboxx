import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import PQueue from "p-queue";

export interface JobContextValue {
  /** Number of currently running jobs */
  jobCount: number;
  /** Adds a job to the queue. Returns a promise that resolves when the job is done. */
  addJob: <T>(fn: () => Promise<T>) => Promise<void | T>;
}

export interface JobContextProviderProps {
  children: React.ReactNode;
}

const JobContext = createContext<JobContextValue | undefined>(undefined);

/** Provides a context that allows adding jobs to a queue. */
export const JobContextProvider = ({ children }: JobContextProviderProps) => {
  const promiseQueue = new PQueue({ concurrency: 4 });
  const [jobCount, setJobCount] = useState(0);
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

  async function addJob<T>(fn: () => Promise<T>) {
    setJobCount((prev) => prev + 1);
    try {
      const result = await promiseQueue.add<T>(fn);
      setJobCount((prev) => prev - 1);
      return result;
    } catch (e) {
      setJobCount((prev) => prev - 1);
      throw e;
    }
  }

  const value: JobContextValue = {
    jobCount,
    addJob,
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
