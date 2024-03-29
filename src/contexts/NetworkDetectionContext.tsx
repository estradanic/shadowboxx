import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";

interface NetworkDetectionContextValue {
  /** Whether the browser is online */
  online: boolean;
}

const NetworkDetectionContext = createContext<
  NetworkDetectionContextValue | undefined
>(undefined);

interface NetworkDetectionContextProviderProps {
  /** Child node */
  children: ReactNode;
}

/** Context to provide the network status */
export const NetworkDetectionContextProvider = ({
  children,
}: NetworkDetectionContextProviderProps) => {
  const [online, setOnline] = useState<boolean>(true);
  useEffect(() => {
    const handler = () => setOnline(navigator.onLine);
    window.addEventListener("online", handler);
    window.addEventListener("offline", handler);
    return () => {
      window.removeEventListener("online", handler);
      window.removeEventListener("offline", handler);
    };
  }, []);

  return (
    <NetworkDetectionContext.Provider value={{ online }}>
      {children}
    </NetworkDetectionContext.Provider>
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
