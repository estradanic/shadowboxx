import React, { useState, useEffect, createContext, useContext } from "react";
import { isEmpty, isMatch } from "lodash";

/**
 * Historical React Router url parameters mapped to route viewId
 */
export type RouteParams = { [viewId: string]: { [param: string]: string } };

/**
 * Array of previously visited routes by viewId
 */
export type RouteHistory = string[];

/**
 * Where to redirect back to after login
 */
export type RedirectRouteInfo = { viewId: string; path: string };

/**
 * Interface defining the return value of the NavigationContext
 */
interface NavigationContextValue {
  /** Historical React Router url parameters mapped to route viewId */
  routeParams: RouteParams;
  /** React state setter for routeParams */
  setRouteParams: React.Dispatch<React.SetStateAction<RouteParams>>;
  /** Array of previously visited routes by viewId */
  routeHistory: RouteHistory;
  /** React state setter for routeHistory */
  setRouteHistory: React.Dispatch<React.SetStateAction<RouteHistory>>;
  /** Where to redirect back to after login */
  redirectRoute: RedirectRouteInfo;
  /** React state setter for redirectRoute */
  setRedirectRoute: React.Dispatch<React.SetStateAction<RedirectRouteInfo>>;
  /** App is loading something */
  globalLoading: boolean;
  /** React state setter for globalLoading */
  setGlobalLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Context to manage navigation and history
 */
const NavigationContext = createContext<NavigationContextValue>({
  routeParams: {},
  setRouteParams: (_: RouteParams | ((_: RouteParams) => RouteParams)) => {},
  routeHistory: [""],
  setRouteHistory: (
    _: RouteHistory | ((_: RouteHistory) => RouteHistory)
  ) => {},
  redirectRoute: { viewId: "", path: "" },
  setRedirectRoute: (
    _: RedirectRouteInfo | ((_: RedirectRouteInfo) => RedirectRouteInfo)
  ) => {},
  globalLoading: false,
  setGlobalLoading: (_: boolean | ((_: boolean) => boolean)) => {},
});

/**
 * Interface defining what to pass to useNavigationContextEffect
 */
interface NavigationInfo {
  /** Historical React Router url parameters mapped to route viewId */
  routeParams?: RouteParams;
  /** Observable values which when changed, trigger a recalculation of routeParams */
  routeParamsUpdateTriggers?: any[];
}

/**
 * Interface defining props for NavigationContextProvider
 */
interface NavigationContextProviderProps {
  /** Child node */
  children: React.ReactNode;
}

/** Custom context provider for NavigationContext */
export const NavigationContextProvider = ({
  children,
}: NavigationContextProviderProps) => {
  const [routeHistory, setRouteHistory] = useState<RouteHistory>([]);
  const [routeParams, setRouteParams] = useState<RouteParams>({});
  const [globalLoading, setGlobalLoading] = useState<boolean>(false);
  const [redirectRoute, setRedirectRoute] = useState<RedirectRouteInfo>({
    viewId: "",
    path: "",
  });

  const value: NavigationContextValue = {
    routeParams,
    setRouteParams,
    routeHistory,
    setRouteHistory,
    redirectRoute,
    setRedirectRoute,
    globalLoading,
    setGlobalLoading,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

/**
 * Alias to useContext(NavigationContext)
 */
export const useNavigationContext = (): NavigationContextValue => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("NavigationContextProvider not found!");
  }
  return context;
};

/**
 * Hook causing a useEffect by which routeParams can be set and observable
 * values provided to trigger recalculation of routeParams when needed
 */
export const useNavigationContextEffect = ({
  routeParams: piRouteParams = {},
  routeParamsUpdateTriggers = [],
}: NavigationInfo = {}) => {
  const {
    routeParams,
    setRouteParams,
    routeHistory,
    setRouteHistory,
  } = useNavigationContext();

  useEffect(() => {
    if (!isEmpty(piRouteParams) && !isMatch(routeParams, piRouteParams)) {
      setRouteParams((prev) => ({
        ...prev,
        ...piRouteParams,
      }));
    }
  }, [
    piRouteParams,
    routeParams,
    setRouteParams,
    // eslint-disable-next-line
    ...routeParamsUpdateTriggers,
  ]);

  return { routeParams, setRouteParams, routeHistory, setRouteHistory };
};
