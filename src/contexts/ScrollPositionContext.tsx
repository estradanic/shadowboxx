import React, { createContext, useCallback, useContext, useState } from "react";

interface ScrollPositionContextValue {
  /** Scroll positions of the PageContainers across pages */
  scrollPositions: {
    [path: string]: number;
  };
  /** React state dispatcher to set scrollPositions */
  setScrollPositions: React.Dispatch<
    React.SetStateAction<{ [path: string]: number }>
  >;
}

const ScrollPositionContext = createContext<
  ScrollPositionContextValue | undefined
>(undefined);

interface ScrollPositionContextProviderProps {
  /** Child node */
  children: React.ReactNode;
}

/** Context to provide scroll positions */
export const ScrollPositionContextProvider = ({
  children,
}: ScrollPositionContextProviderProps) => {
  const [scrollPositions, setScrollPositions] = useState({});

  return (
    <ScrollPositionContext.Provider
      value={{ scrollPositions, setScrollPositions }}
    >
      {children}
    </ScrollPositionContext.Provider>
  );
};

/** Adapter to useContext(ScrollPositionContext) */
export const useScrollPositionContext = () => {
  const context = useContext(ScrollPositionContext);
  if (context === undefined) {
    throw new Error("No ScrollPositionContextProvider found!");
  }

  const pushScrollPosition = useCallback(
    (path: string, scrollPosition: number) => {
      context.setScrollPositions((prev) => ({
        ...prev,
        [path]: scrollPosition,
      }));
    },
    [context]
  );

  const getScrollPosition = useCallback(
    (path: string) => {
      return context.scrollPositions[path] ?? 0;
    },
    [context]
  );

  return { pushScrollPosition, getScrollPosition };
};
