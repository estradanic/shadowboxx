import React, { createContext, useContext, useState } from "react";
import { LoadingWrapperProps } from "../components/Loader/LoadingWrapper";

interface GlobalLoadingContextValue {
  /** Whether the whole page is loading */
  globalLoading?: LoadingWrapperProps["loading"];
  /** Function to set globalLoading */
  setGlobalLoading: React.Dispatch<
    React.SetStateAction<LoadingWrapperProps["loading"]>
  >;
  /** Progress value (0-100) of the global loader */
  globalProgress?: LoadingWrapperProps["progress"];
  /** Function to set globalProgress */
  setGlobalProgress: React.Dispatch<
    React.SetStateAction<LoadingWrapperProps["progress"]>
  >;
  /** Type of the global loader */
  globalLoaderType?: LoadingWrapperProps["type"];
  /** Function to set globalLoaderType */
  setGlobalLoaderType: React.Dispatch<
    React.SetStateAction<LoadingWrapperProps["type"]>
  >;
  /** Content (such as text) to show in the loader */
  globalLoaderContent?: LoadingWrapperProps["content"];
  /** Function to set globalLoaderContent */
  setGlobalLoaderContent: React.Dispatch<
    React.SetStateAction<LoadingWrapperProps["content"]>
  >;
  /** Function to reset the global loader back to defaults ({loading: false, progress: 0, type: "indeterminate"}) */
  resetGlobalLoader: () => void;
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

  const resetGlobalLoader = () => {
    setGlobalLoading(false);
    setGlobalProgress(5);
    setGlobalLoaderType("indeterminate");
    setGlobalLoaderContent(undefined);
  };

  return (
    <GlobalLoadingContext.Provider
      value={{
        globalLoading,
        setGlobalLoading,
        globalProgress,
        setGlobalProgress,
        globalLoaderType,
        setGlobalLoaderType,
        globalLoaderContent,
        setGlobalLoaderContent,
        resetGlobalLoader,
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
