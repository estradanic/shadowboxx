import { useCallback, useEffect, useRef } from "react";
import { useDebounce } from "use-debounce";

export type UseInfiniteScrollOptions = {
  /** CSS selector for the element to attach the event listener to */
  elementQuerySelector?: string;
  /** Number of pixels from the bottom to run onThresholdReached */
  scrollThreshold?: number;
  /**
   * Whether the function can execute or not.
   * Allows dynamic enabling/disabling
   */
  canExecute?: boolean;
};

/**
 * Hook to run a function when a certain scroll threshold is reached
 */
const useInfiniteScroll = (
  piOnThresholdReached: () => any | Promise<any>,
  {
    elementQuerySelector,
    scrollThreshold = 300,
    canExecute = true,
  }: UseInfiniteScrollOptions = {}
) => {
  let element = useRef<Element | null>(null);

  const [onThresholdReached] = useDebounce(piOnThresholdReached, 1000);

  const onScroll = useCallback(async () => {
    if (
      element.current &&
      element.current.scrollHeight -
        element.current.scrollTop -
        element.current.clientHeight <
        scrollThreshold &&
      canExecute
    ) {
      await onThresholdReached();
    }
  }, [canExecute, scrollThreshold, onThresholdReached, element]);

  useEffect(() => {
    if (element.current) {
      element.current.removeEventListener("scroll", onScroll);
    }
    requestAnimationFrame(() => {
      element.current = document.querySelector(
        elementQuerySelector ?? "body"
      );
      if (element.current) {
        element.current.addEventListener("scroll", onScroll);
      }
    });
    return () => {
      if (element.current) {
        element.current.removeEventListener("scroll", onScroll);
      }
    };
  }, [element, onScroll, elementQuerySelector]);
};

export default useInfiniteScroll;
