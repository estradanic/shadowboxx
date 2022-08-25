import React, { createContext, useContext } from "react";
import { Detector } from "react-detect-offline";

interface NetworkDetectionContextValue {
  /** Whether httpbin.org can be reached or not */
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
      polling={{
        url: "https://httpbin.org/get",
        enabled: true,
        interval: 7500,
        timeout: 5000,
      }}
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
