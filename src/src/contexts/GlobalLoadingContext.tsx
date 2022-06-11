import React, { createContext, useContext, useState } from "react";

interface GlobalLoadingContextValue {
  globalLoading: boolean;
  setGlobalLoading: React.Dispatch<React.SetStateAction<boolean>>;
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
  const [globalLoading, setGlobalLoading] = useState<boolean>(false);

  return (
    <GlobalLoadingContext.Provider value={{ globalLoading, setGlobalLoading }}>
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
