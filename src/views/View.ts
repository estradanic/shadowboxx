import {match} from "react-router-dom";
import {UserInfo, useUserContext} from "../app/UserContext";
import {useRoutes} from "../app/routes";
import {useNavigationContext} from "../app/NavigationContext";
import {useHistory} from "react-router-dom";
import {sendHTTPRequest} from "../utils/requestUtils";
import {useEffect} from "react";

/**
 * Interface to define access to React Router path parameters.
 * */
export interface ViewProps<Params> {
  /** Match property provided by React Router */
  match: match<Params>;
}

/**
 * Helper function to be run in a useEffect at the beginning of every View component.
 * @param currentViewId
 */
export const useView = (currentViewId: string) => {
  const {
    routeHistory,
    setRouteHistory,
    redirectRoute,
    setRedirectRoute,
    routeParams,
  } = useNavigationContext();
  const {loggedIn, loginSucceed} = useUserContext();
  const {getRoutePath, routes} = useRoutes();
  const history = useHistory();
  const currentRoute = routes[currentViewId];

  useEffect(() => {
    if (loggedIn) {
      if (!currentRoute.authenticate) {
        if (redirectRoute?.viewId) {
          const redirectPath = getRoutePath(redirectRoute?.viewId, routeParams);
          setRedirectRoute({viewId: "", path: ""});
          history.push(redirectPath);
        }
      } else {
        const newRouteHistory = [...routeHistory];
        if (currentViewId !== routeHistory[0]) {
          newRouteHistory.splice(0, 0, currentViewId);
          setRouteHistory(newRouteHistory);
        }
      }
    } else if (currentRoute.authenticate) {
      sendHTTPRequest<string, UserInfo>({
        method: "POST",
        url: "/api/func_SessionAuthenticate",
        callback: loginSucceed,
        errorCallback: () => {
          const loginRoute = routes["Login"];
          setRedirectRoute({
            viewId: currentViewId,
            path: getRoutePath(currentViewId, routeParams),
          });
          history.push(loginRoute.path);
        },
      });
    }
  }, [
    loggedIn,
    currentRoute.authenticate,
    currentViewId,
    getRoutePath,
    history,
    loginSucceed,
    redirectRoute?.viewId,
    routeHistory,
    routeParams,
    routes,
    setRedirectRoute,
    setRouteHistory,
  ]);
};
