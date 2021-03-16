import {ComponentType} from "react";
import {Home, Login, Signup} from "../views";
import {RouteParams} from "./NavigationContext";
import {isEmpty} from "lodash";

export interface RouteProps {
  viewName: string;
  viewId: string;
  view: ComponentType<any>;
  path: string;
  parentKey?: string;
  layout?: string;
  exact?: boolean;
}

const routes: {[key: string]: RouteProps} = {
  Home: {
    viewId: "Home",
    viewName: "Home",
    view: Home,
    path: "/home",
  },
  Login: {
    viewId: "Login",
    viewName: "Login",
    view: Login,
    path: "/login",
  },
  Signup: {
    viewId: "Signup",
    viewName: "Signup",
    view: Signup,
    path: "/signup",
  },
  Root: {
    viewId: "Root",
    viewName: "Home",
    view: Home,
    path: "/",
  },
};

const getRoutePath = (viewId: string, routeParams: RouteParams): string => {
  const templatePath = routes[viewId]?.path;
  if (!templatePath) {
    return "";
  }

  if (isEmpty(routeParams)) {
    return templatePath;
  }

  // @ts-ignore: routeParams is definitely not empty as per above check
  const params = routeParams[viewId];
  if (!params || isEmpty(params)) {
    return templatePath;
  }

  let path = templatePath;
  Object.keys(params).forEach((param) => {
    path = path.replace(`:${param}`, params[param]);
  });

  return path;
};

export const useRoutes = () => ({getRoutePath, routes});
