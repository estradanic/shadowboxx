import React, {useState, useEffect, createContext, useContext} from "react";
import {isEmpty, isMatch} from "lodash";

type RouteParams = {[viewId: string]: {[param: string]: string}};
type PrevRoutes = string[];

interface NavigationContextValue {
  routeParams: RouteParams;
  setRouteParams: React.Dispatch<React.SetStateAction<RouteParams>>;
  prevRoutes: PrevRoutes;
  setPrevRoutes: React.Dispatch<React.SetStateAction<PrevRoutes>>;
}

const NavigationContext = createContext({
  routeParams: {},
  setRouteParams: (_: RouteParams | ((_: RouteParams) => RouteParams)) => {},
  prevRoutes: [""],
  setPrevRoutes: (_: PrevRoutes | ((_: PrevRoutes) => PrevRoutes)) => {},
});

interface NavigationInfo {
  routeParams?: RouteParams;
  routeParamsUpdateTriggers?: any[];
}

interface NavigationContextProviderProps {
  children: React.ReactNode;
}

export const NavigationContextProvider = ({
  children,
}: NavigationContextProviderProps) => {
  const [prevRoutes, setPrevRoutes] = useState<PrevRoutes>([]);
  const [routeParams, setRouteParams] = useState<RouteParams>({});

  const value: NavigationContextValue = {
    routeParams,
    setRouteParams,
    prevRoutes,
    setPrevRoutes,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigationContext = ({
  routeParams: piRouteParams = {},
  routeParamsUpdateTriggers = [],
}: NavigationInfo = {}) => {
  const {routeParams, setRouteParams, prevRoutes, setPrevRoutes} = useContext(
    NavigationContext,
  );

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

  return {routeParams, setRouteParams, prevRoutes, setPrevRoutes};
};
