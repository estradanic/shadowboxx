import { useCallback, useEffect, useLayoutEffect } from "react";
import { useLocation, createPath } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useUserContext } from "../contexts";
import { routes } from "../app";
import { useScrollPositionStore } from "../stores";
import { useNavigate } from "../hooks";

/**
 * Hook that handles navigation, query invalidation, and authentication at the beginning of every View component.
 */
export const useView = (currentViewId: string) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const currentRoute = routes[currentViewId];
  const { isUserLoggedIn, setRedirectPath } = useUserContext();
  const getScrollPosition = useScrollPositionStore(
    (state) => state.getScrollPosition
  );

  useLayoutEffect(() => {
    currentRoute.queryCacheGroups.forEach((queryCacheGroup) => {
      queryClient.invalidateQueries({ queryKey: [queryCacheGroup] });
    });
  }, [currentRoute.queryCacheGroups, queryClient]);

  const redirectToLogin = useCallback(() => {
    if (currentRoute.redirectOnAuthFail) {
      const loginRoute = routes.Login;
      setRedirectPath(createPath(location));
      navigate(loginRoute.path);
    }
  }, [currentRoute, setRedirectPath, navigate, location]);

  useLayoutEffect(() => {
    if (!isUserLoggedIn && currentRoute.tryAuthenticate) {
      redirectToLogin();
    }
  }, [currentRoute, redirectToLogin, isUserLoggedIn]);

  useEffect(() => {
    document.body.scrollTo(0, getScrollPosition(location.pathname));
  }, [location.pathname, getScrollPosition]);
};
