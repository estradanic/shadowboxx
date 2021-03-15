import React, {useState, useEffect, createContext, useContext} from "react";
import {isEmpty, isMatch} from "lodash";

export type RouteParams = {[viewId: string]: {[param: string]: string}};
export type RouteHistory = string[];

interface NavigationContextValue {
  routeParams: RouteParams;
  setRouteParams: React.Dispatch<React.SetStateAction<RouteParams>>;
  routeHistory: RouteHistory;
  setRouteHistory: React.Dispatch<React.SetStateAction<RouteHistory>>;
}

const NavigationContext = createContext({
  routeParams: {},
  setRouteParams: (_: RouteParams | ((_: RouteParams) => RouteParams)) => {},
  routeHistory: [""],
  setRouteHistory: (
    _: RouteHistory | ((_: RouteHistory) => RouteHistory),
  ) => {},
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
  const [routeHistory, setRouteHistory] = useState<RouteHistory>([]);
  const [routeParams, setRouteParams] = useState<RouteParams>({});

  const value: NavigationContextValue = {
    routeParams,
    setRouteParams,
    routeHistory,
    setRouteHistory,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigationContext = () => useContext(NavigationContext);

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

  return {routeParams, setRouteParams, routeHistory, setRouteHistory};
};
