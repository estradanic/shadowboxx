import { useCallback, useEffect, useLayoutEffect } from "react";
import { useLocation, createPath } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useUserContext } from "../contexts";
import { routes } from "../app";
import { useGlobalLoadingStore, useScrollPositionStore } from "../stores";
import {
  useNavigate,
  useDuplicatesNotifications,
  useAlbumChangeNotifications,
} from "../hooks";
import { useSnackbar } from "../components";
import { Strings } from "../resources";
import { useDebounce } from "use-debounce";

/**
 * Hook that handles navigation, query invalidation, and authentication at the beginning of every View component.
 */
export const useView = (currentViewId: keyof typeof routes) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const currentRoute = routes[currentViewId];
  const { isUserLoggedIn, setRedirectPath } = useUserContext();
  const { stopGlobalLoader } = useGlobalLoadingStore();
  const { enqueueWarningSnackbar, closeSnackbar } = useSnackbar();
  const getScrollPosition = useScrollPositionStore(
    (state) => state.getScrollPosition
  );

  useLayoutEffect(() => {
    currentRoute.queryCacheGroups.forEach((queryCacheGroup) => {
      queryClient.invalidateQueries({ queryKey: [queryCacheGroup] });
    });
  }, [currentRoute.queryCacheGroups, queryClient]);

  const redirectToLogin = useCallback(() => {
    closeSnackbar();
    stopGlobalLoader();
    enqueueWarningSnackbar(Strings.pleaseLogin());
    if (currentRoute.redirectOnAuthFail) {
      const loginRoute = routes.Login;
      setRedirectPath(createPath(location));
      navigate(loginRoute.path);
    }
  }, [
    currentRoute,
    setRedirectPath,
    navigate,
    location,
    stopGlobalLoader,
    enqueueWarningSnackbar,
    closeSnackbar,
  ]);

  useLayoutEffect(() => {
    if (!isUserLoggedIn && currentRoute.tryAuthenticate) {
      redirectToLogin();
    }
  }, [currentRoute, redirectToLogin, isUserLoggedIn]);

  useEffect(() => {
    setTimeout(() => {
      document.body.scrollTo(0, getScrollPosition(location.pathname));
    });
  }, [location.pathname, getScrollPosition]);

  useDuplicatesNotifications();
  useAlbumChangeNotifications();
};
