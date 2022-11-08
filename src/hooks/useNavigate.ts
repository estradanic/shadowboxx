import {
  useNavigate as useRouterNavigate,
  Location,
  To,
} from "react-router-dom";
import { useScrollPositionStore } from "../stores";

/**
 * Hook that provides the react-router navigate function to go back and forth between pages.
 * Adds some state handling to it for scrollPosition and history
 */
const useNavigate = () => {
  const routerNavigate = useRouterNavigate();
  const pushScrollPosition = useScrollPositionStore(
    (state) => state.pushScrollPosition
  );

  return (nextLocation: To, previousLocation?: Location) => {
    if (previousLocation) {
      pushScrollPosition(
        previousLocation?.pathname,
        document.body.scrollTop ?? 0
      );
    }
    return routerNavigate(nextLocation, { state: { previousLocation } });
  };
};

export default useNavigate;
