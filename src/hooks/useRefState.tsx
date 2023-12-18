import { useState, useRef, useEffect, MutableRefObject } from "react";
import { NonFunction } from "../types";

export type RefStateReturn<T> = [
  MutableRefObject<T>,
  T,
  (update: T | ((prev: T) => T)) => void
];

/**
 * Returns state and ref together with a function that updates both of them.
 * Either one changing will trigger a rerender, but the ref also remains stable.
 */
function useRefState<T extends NonFunction>(
  defaultValue: T
): RefStateReturn<T> {
  const [state, setState] = useState<T>(defaultValue);
  const stateRef = useRef<T>(defaultValue);

  useEffect(() => {
    setState(stateRef.current);
    // Disabling eslint here because I *do* want the ref change to trigger an update
    // eslint-disable-next-line
  }, [stateRef.current]);

  const updateRefState = (update: T | ((prev: T) => T)) => {
    setState((prev) => {
      const newState = typeof update === "function" ? update(prev) : update;
      stateRef.current = newState;
      return newState;
    });
  };

  return [stateRef, state, updateRefState];
}

export default useRefState;
