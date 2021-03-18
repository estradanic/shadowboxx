import {ComponentType} from "react";
import {Home, Login, Signup} from "../views";
import {RouteParams} from "./NavigationContext";
import {isEmpty} from "lodash";

/**
 * Interface defining a route object
 */
export interface RouteProps {
  /** Name of view to appear in header */
  viewName: string;
  /** Id of view. Should be same as key in the routes object */
  viewId: string;
  /** React Component to render in the layout */
  view: ComponentType<any>;
  /** React Router path */
  path: string;
  /** Key (viewId) for the parent route (/parent/child in the path) */
  parentKey?: string;
  /** What layout to use for this route. Defaults to DefaultLayout */
  layout?: string;
  /** Does path have to match exactly */
  exact?: boolean;
  /** Whether or not this page needs authentication */
  authenticate?: boolean;
}

/**
 * Universal routes map containing all pages for the site
 */
const routes: {[key: string]: RouteProps} = {
  Home: {
    viewId: "Home",
    viewName: "Home",
    view: Home,
    path: "/home",
    authenticate: false,
  },
  Login: {
    viewId: "Login",
    viewName: "Login",
    view: Login,
    path: "/login",
    authenticate: false,
  },
  Signup: {
    viewId: "Signup",
    viewName: "Signup",
    view: Signup,
    path: "/signup",
    authenticate: false,
  },
  Root: {
    viewId: "Root",
    viewName: "Home",
    view: Home,
    path: "/",
    authenticate: false,
  },
};

/**
 * Helper function to get the path for a route including parameters
 */
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
