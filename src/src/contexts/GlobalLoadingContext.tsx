import React, { createContext, useContext, useState } from "react";
import { LoadingWrapperProps } from "../components/Loader/LoadingWrapper";

type StartGlobalLoaderOptions = {
  content?: LoadingWrapperProps["content"];
} & (
  | {
      type: "determinate";
      progress?: LoadingWrapperProps["progress"];
    }
  | {
      type: "indeterminate";
      progress?: undefined;
    }
);

type UpdateGlobalLoaderOptions = {
  content?: LoadingWrapperProps["content"];
  progress?: LoadingWrapperProps["progress"];
};

interface GlobalLoadingContextValue {
  /** Whether the whole page is loading */
  globalLoading?: LoadingWrapperProps["loading"];
  /** Progress value (0-100) of the global loader */
  globalProgress?: LoadingWrapperProps["progress"];
  /** Type of the global loader */
  globalLoaderType?: LoadingWrapperProps["type"];
  /** Content (such as text) to show in the loader */
  globalLoaderContent?: LoadingWrapperProps["content"];
  /** Function to start a global loader */
  startGlobalLoader: (options?: StartGlobalLoaderOptions) => void;
  /** Function to update a global loader */
  updateGlobalLoader: (options: UpdateGlobalLoaderOptions) => void;
  /** Function to reset the global loader back to defaults ({loading: false, progress: 0, type: "indeterminate"}) */
  stopGlobalLoader: () => void;
}

const GlobalLoadingContext = createContext<
  GlobalLoadingContextValue | undefined
>(undefined);

interface GlobalLoadingContextProviderProps {
  /** Child node */
  children: React.ReactNode;
}

export const GlobalLoadingContextProvider = ({
  children,
}: GlobalLoadingContextProviderProps) => {
  const [globalLoading, setGlobalLoading] = useState<
    LoadingWrapperProps["loading"]
  >(false);
  const [globalProgress, setGlobalProgress] = useState<
    LoadingWrapperProps["progress"]
  >(5);
  const [globalLoaderType, setGlobalLoaderType] = useState<
    LoadingWrapperProps["type"]
  >("indeterminate");
  const [globalLoaderContent, setGlobalLoaderContent] = useState<
    LoadingWrapperProps["content"]
  >();

  const stopGlobalLoader = () => {
    setGlobalLoading(false);
    setGlobalProgress(5);
    setGlobalLoaderType("indeterminate");
    setGlobalLoaderContent(undefined);
  };

  const startGlobalLoader = (options?: StartGlobalLoaderOptions) => {
    if (options) {
      if (options.progress) {
        setGlobalProgress(options.progress);
      }
      setGlobalLoaderType(options.type);
      setGlobalLoaderContent(options.content);
    }
    setGlobalLoading(true);
  };

  const updateGlobalLoader = (options: UpdateGlobalLoaderOptions) => {
    if (options.progress !== undefined) {
      setGlobalProgress(options.progress);
    }
    if (options.content !== undefined) {
      setGlobalLoaderContent(options.content);
    }
  };

  return (
    <GlobalLoadingContext.Provider
      value={{
        startGlobalLoader,
        updateGlobalLoader,
        stopGlobalLoader,
        globalLoading,
        globalProgress,
        globalLoaderType,
        globalLoaderContent,
      }}
    >
      {children}
    </GlobalLoadingContext.Provider>
  );
};

/** Alias to useContext(GlobalLoadingContext) */
export const useGlobalLoadingContext = () => {
  const context = useContext(GlobalLoadingContext);
  if (context === undefined) {
    throw new Error("No GlobalLodingContextProvider found!");
  }
  return context;
};
