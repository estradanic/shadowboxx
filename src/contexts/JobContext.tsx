import React, { createContext, useContext, useState } from "react";
import PQueue from 'p-queue';
import useNoSleep from 'use-no-sleep';

export interface JobContextValue {
  jobCount: number;
  addJob: <T>(fn: (() => Promise<T>)) => Promise<void | T>;
}

export interface JobContextProviderProps {
  children: React.ReactNode;
}

const JobContext = createContext<JobContextValue | undefined>(undefined);

export const JobContextProvider = ({ children }: JobContextProviderProps) => {
  const promiseQueue = new PQueue({ concurrency: 4 });
  const [jobCount, setJobCount] = useState(0);
  useNoSleep(jobCount > 0);

  async function addJob<T>(fn: (() => Promise<T>)) {
    setJobCount((prev) => prev + 1);
    const result = await promiseQueue.add<T>(fn);
    setJobCount((prev) => prev - 1);
    return result;
  };

  const value: JobContextValue = {
    jobCount,
    addJob,
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobContext = () => {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error("useJobContext must be used within a JobContextProvider");
  }
  return context;
};
