import { useState, useRef, useEffect } from "react";

export type RefStateReturn<T> = [
  React.MutableRefObject<T>,
  T,
  (newState: T) => void
];

/**
 * Returns state and ref together with a function that updates both of them.
 * Either one changing will trigger a rerender, but the ref also remains stable.
 */
function useRefState<T = any>(defaultValue: T): RefStateReturn<T> {
  const [state, setState] = useState<T>(defaultValue);
  const stateRef = useRef<T>(defaultValue);

  useEffect(() => {
    setState(stateRef.current);
    // Disabling eslint here because I *do* want the ref change to trigger an update
    // eslint-disable-next-line
  }, [stateRef.current]);

  const updateRefState = (newState: T) => {
    setState(newState);
    stateRef.current = newState;
  };

  return [stateRef, state, updateRefState];
}

export default useRefState;
