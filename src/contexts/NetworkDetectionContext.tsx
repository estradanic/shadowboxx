import React, { createContext, useContext } from "react";
import { Detector } from "react-detect-offline";

interface NetworkDetectionContextValue {
  /** Whether the browser is online or not */
  online: boolean;
}

const NetworkDetectionContext = createContext<
  NetworkDetectionContextValue | undefined
>(undefined);

interface NetworkDetectionContextProviderProps {
  /** Child node */
  children: React.ReactNode;
}

/** Context to provide the network status */
export const NetworkDetectionContextProvider = ({
  children,
}: NetworkDetectionContextProviderProps) => {
  return (
    <Detector
      render={({ online }) => (
        <NetworkDetectionContext.Provider value={{ online }}>
          {children}
        </NetworkDetectionContext.Provider>
      )}
    />
  );
};

/** Alias to useContext(NetworkDetectionContext) */
export const useNetworkDetectionContext = () => {
  const context = useContext(NetworkDetectionContext);
  if (context === undefined) {
    throw new Error("No NetworkDetectionContextProvider found!");
  }
  return context;
};
