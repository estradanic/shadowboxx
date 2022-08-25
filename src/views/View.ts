import { useCallback, useLayoutEffect } from "react";
import { useNavigate, useLocation, createPath } from "react-router-dom";
import { useUserContext } from "../contexts";
import { routes } from "../app";

/**
 * Hook that handles navigation and authentication management at the beginning of every View component.
 */
export const useView = (currentViewId: string) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentRoute = routes[currentViewId];
  const { isUserLoggedIn, setRedirectPath } = useUserContext();

  const redirectToLogin = useCallback(() => {
    if (currentRoute.redirectOnAuthFail) {
      const loginRoute = routes["Login"];
      setRedirectPath(createPath(location));
      navigate(loginRoute.path);
    }
  }, [currentRoute, setRedirectPath, history]);

  useLayoutEffect(() => {
    if (!isUserLoggedIn && currentRoute.tryAuthenticate) {
      redirectToLogin();
    }
  }, [currentRoute, redirectToLogin, isUserLoggedIn]);
};
