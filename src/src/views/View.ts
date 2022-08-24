import { useCallback, useLayoutEffect } from "react";
import { useHistory } from "react-router-dom";
import { useUserContext } from "../contexts";
import { routes } from "../app";

/**
 * Hook that handles navigation and authentication management at the beginning of every View component.
 */
export const useView = (currentViewId: string) => {
  const history = useHistory();
  const currentRoute = routes[currentViewId];
  const { isUserLoggedIn, setRedirectPath } = useUserContext();

  const redirectToLogin = useCallback(() => {
    if (currentRoute.redirectOnAuthFail) {
      const loginRoute = routes["Login"];
      setRedirectPath(history.createHref(history.location));
      history.push(loginRoute.path);
    }
  }, [currentRoute, setRedirectPath, history]);

  useLayoutEffect(() => {
    if (!isUserLoggedIn && currentRoute.tryAuthenticate) {
      redirectToLogin();
    }
  }, [currentRoute, redirectToLogin, isUserLoggedIn]);
};
