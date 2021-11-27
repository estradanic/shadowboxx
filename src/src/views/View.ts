import { match } from "react-router-dom";
import { useUserContext } from "../app/UserContext";
import { useRoutes } from "../app/routes";
import { useNavigationContext } from "../app/NavigationContext";
import { useHistory } from "react-router-dom";
import { useEffect } from "react";
import Parse from "parse";

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
  const { loggedIn, loginSucceed } = useUserContext();
  const { getRoutePath, routes } = useRoutes();
  const history = useHistory();
  const currentRoute = routes[currentViewId];

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
    if (loggedIn) {
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
      Parse.User.currentAsync()
        .then((user) => {
          if (user) {
            loginSucceed(user);
          } else {
            redirectToLogin();
          }
        })
        .catch(redirectToLogin);
    }
    // Only rerun when loggedIn or routeParams changes.
    // Eslint is being over-protective here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn, routeParams]);
};
