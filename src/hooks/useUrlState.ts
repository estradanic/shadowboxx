import { useSearchParams } from "react-router-dom";
import { NonFunction } from "../types";

const useUrlState = <T extends NonFunction>(
  name: string,
  initial: T | (() => T),
  options: {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
  } = {}
) => {
  const serialize = options.serialize ?? JSON.stringify;
  const deserialize = options.deserialize ?? JSON.parse;
  const [searchParams, setSearchParams] = useSearchParams();
  const urlState = searchParams.get(name);
  const state: T = urlState ? deserialize(urlState) : initial;

  const setUrlState = (newState: T | ((prev: T) => T)) => {
    setSearchParams((prevSearchParams) => {
      const currentParams = new URLSearchParams(prevSearchParams);

      // Get the current value from the URL
      const currentValue = currentParams.get(name);

      // Get the new state value
      const newValue =
        typeof newState === "function"
          ? (newState as (prev: T) => T)(
              !!currentValue ? deserialize(currentValue) : state
            )
          : newState;

      // Update only the specified parameter in the URL
      if (newValue !== undefined) {
        currentParams.set(name, serialize(newValue));
      } else {
        currentParams.delete(name);
      }

      return currentParams.toString();
    });
  };

  return [state, setUrlState] as const;
};

export default useUrlState;
