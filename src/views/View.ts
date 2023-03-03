import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, createPath } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import routes from "../app/routes";
import { useGlobalLoadingStore, useScrollPositionStore } from "../stores";
import { useSnackbar } from "../components";
import { Strings } from "../resources";
import useNavigate from "../hooks/useNavigate";
import useDuplicatesNotifications from "../hooks/Notifications/useDuplicatesNotifications";
import useAlbumChangeNotifications from "../hooks/Notifications/useAlbumChangeNotifications";
import { useUserContext } from "../contexts/UserContext";

/**
 * Hook that handles navigation, query invalidation, and authentication at the beginning of every View component.
 */
export const useView = (currentViewId: keyof typeof routes) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const currentRoute = routes[currentViewId];
  const showingSnackbarAlready = useRef(false);
  const { isUserLoggedIn, setRedirectPath } = useUserContext();
  const { stopGlobalLoader } = useGlobalLoadingStore((state) => ({
    stopGlobalLoader: state.stopGlobalLoader,
  }));
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
    stopGlobalLoader();
    // Stupid hack to prevent duplicate snackbar
    if (!showingSnackbarAlready.current) {
      closeSnackbar();
      enqueueWarningSnackbar(Strings.message.pleaseLogin);
      showingSnackbarAlready.current = true;
    }
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
