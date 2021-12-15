import { match } from "react-router-dom";
import { useRoutes } from "../app/routes";
import { useNavigationContext } from "../app/NavigationContext";
import { useHistory } from "react-router-dom";
import { useEffect } from "react";
import { useUserContext } from "../app/UserContext";
/**
 * Interface to define access to React Router path parameters.
 */
export interface ViewProps<Params> {
  /** Match property provided by React Router */
  match: match<Params>;
}

/**
 * Hook that handles navigation and authentication management at the beginning of every View component.
 */
export const useView = (currentViewId: string) => {
  const {
    routeHistory,
    setRouteHistory,
    redirectRoute,
    setRedirectRoute,
    routeParams,
    setGlobalLoading,
  } = useNavigationContext();
  const { getRoutePath, routes } = useRoutes();
  const history = useHistory();
  const currentRoute = routes[currentViewId];
  const { loggedInUser } = useUserContext();

  const redirectToLogin = () => {
    setGlobalLoading(false);
    if (currentRoute.redirectOnAuthFail) {
      const loginRoute = routes["Login"];
      setRedirectRoute({
        viewId: currentViewId,
        path: getRoutePath(currentViewId, routeParams),
      });
      history.push(loginRoute.path);
    }
  };

  useEffect(() => {
    if (loggedInUser) {
      if (!currentRoute.redirectOnAuthFail) {
        if (redirectRoute?.viewId) {
          const redirectPath = getRoutePath(redirectRoute?.viewId, routeParams);
          setRedirectRoute({ viewId: "", path: "" });
          history.push(redirectPath);
        }
      }
      const newRouteHistory = [...routeHistory];
      if (currentViewId !== routeHistory[0]) {
        newRouteHistory.unshift(currentViewId);
        setRouteHistory(newRouteHistory);
      }
    } else if (currentRoute.tryAuthenticate) {
      setGlobalLoading(true);
      redirectToLogin();
    }
  }, [
    routeParams,
    currentRoute.redirectOnAuthFail,
    currentRoute.tryAuthenticate,
    currentViewId,
    getRoutePath,
    history,
    redirectRoute?.viewId,
    redirectToLogin,
    routeHistory,
    setGlobalLoading,
    setRedirectRoute,
    setRouteHistory,
    loggedInUser,
  ]);
};
