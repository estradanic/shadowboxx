import {ComponentType} from "react";
import {Home, About, Dynamic, Login, Signup} from "../views";
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
  AboutDynamic: {
    viewId: "AboutDynamic",
    viewName: "Hola",
    view: Dynamic,
    path: "/about/child/child2/:someParam",
    parentKey: "AboutChild2",
  },
  AboutChild2: {
    viewId: "AboutChild2",
    viewName: "2319",
    view: About,
    path: "/about/child/child2",
    parentKey: "AboutChild",
  },
  AboutChild: {
    viewId: "AboutChild",
    viewName: "About Child",
    view: About,
    path: "/about/child",
    parentKey: "About",
  },
  About: {
    viewId: "About",
    viewName: "About",
    view: About,
    path: "/about",
  },
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
