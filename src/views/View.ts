import { useCallback, useEffect, useLayoutEffect } from "react";
import { useLocation, createPath } from "react-router-dom";
import { useUserContext } from "../contexts";
import { routes } from "../app";
import { useScrollPositionContext } from "../contexts";
import { PAGE_CONTAINER_ID } from "../constants";
import { useNavigate } from "../hooks";

/**
 * Hook that handles navigation and authentication management at the beginning of every View component.
 */
export const useView = (currentViewId: string) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentRoute = routes[currentViewId];
  const { isUserLoggedIn, setRedirectPath } = useUserContext();
  const { getScrollPosition } = useScrollPositionContext();

  const redirectToLogin = useCallback(() => {
    if (currentRoute.redirectOnAuthFail) {
      const loginRoute = routes.Login;
      setRedirectPath(createPath(location));
      navigate(loginRoute.path);
    }
  }, [currentRoute, setRedirectPath, history]);

  useLayoutEffect(() => {
    if (!isUserLoggedIn && currentRoute.tryAuthenticate) {
      redirectToLogin();
    }
  }, [currentRoute, redirectToLogin, isUserLoggedIn]);

  useEffect(() => {
    document
      .querySelector(`#${PAGE_CONTAINER_ID}`)
      ?.scrollTo(0, getScrollPosition(location.pathname));
  }, []);
};
