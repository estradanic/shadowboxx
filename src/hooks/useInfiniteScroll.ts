import {
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useDebounce } from "use-debounce";
import { PAGE_CONTAINER_ID } from "../constants";

export type UseInfiniteScrollOptions = {
  elementQuerySelector?: string;
  scrollThreshold?: number;
  canExecute?: boolean;
};

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
      element.current = document.querySelector(elementQuerySelector ?? `#${PAGE_CONTAINER_ID}`);
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
