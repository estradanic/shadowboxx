import { match, useLocation } from "react-router-dom";
import { useRoutes } from "../app/routes";
import { useNavigationContext } from "../app/NavigationContext";
import { useHistory } from "react-router-dom";
import { useCallback, useEffect } from "react";
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
  const { search } = useLocation();

  const redirectToLogin = useCallback(() => {
    setGlobalLoading(false);
    if (currentRoute.redirectOnAuthFail) {
      const loginRoute = routes["Login"];
      setRedirectRoute({
        viewId: currentViewId,
        path: getRoutePath({ viewId: currentViewId, search }, routeParams),
      });
      history.push(loginRoute.path);
    }
  }, [
    setGlobalLoading,
    setRedirectRoute,
    getRoutePath,
    routes,
    history,
    currentRoute.redirectOnAuthFail,
    currentViewId,
    routeParams,
    search,
  ]);

  useEffect(() => {
    if (loggedInUser) {
      if (!currentRoute.redirectOnAuthFail) {
        if (redirectRoute?.path) {
          setRedirectRoute({ viewId: "", path: "" });
          history.push(redirectRoute.path);
        }
      }
      const newRouteHistory = [...routeHistory];
      if (currentViewId !== routeHistory[0]?.viewId) {
        newRouteHistory.unshift({ viewId: currentViewId, search });
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
    redirectRoute.path,
    search,
  ]);
};
