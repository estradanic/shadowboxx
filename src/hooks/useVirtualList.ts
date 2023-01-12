import { useState, useLayoutEffect, useCallback, useRef } from "react";

export interface UseVirtualListReturn<T> {
  virtualized: T[];
  reset: () => void;
}

export interface UseVirtualListParams<T> {
  interval: number;
  list?: T[];
  enabled: boolean;
}

const useVirtualList = <T>({
  list,
  interval,
  enabled,
}: UseVirtualListParams<T>): UseVirtualListReturn<T> => {
  const [virtualized, setVirtualized] = useState<T[]>([]);
  const iRef = useRef<number>(0);

  useLayoutEffect(() => {
    if (!enabled || !list) {
      return;
    }
    const timer = setInterval(() => {
      if (!enabled || !list) {
        return;
      }
      if (iRef.current === list.length) {
        clearInterval(timer);
        return;
      }
      setVirtualized((prev) => [...prev, list[iRef.current]]);
      iRef.current++;
    }, interval);
    return () => {
      clearInterval(timer);
    };
  }, [list, interval, enabled]);

  const reset = useCallback(() => {
    iRef.current = 0;
    setVirtualized([]);
  }, [iRef, setVirtualized]);

  return { virtualized, reset };
};

export default useVirtualList;
