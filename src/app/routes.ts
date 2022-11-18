import { ComponentType, lazy } from "react";
import QueryCacheGroups from "../hooks/Query/QueryCacheGroups";

// Lazy importing these to allow code-splitting
const Home = lazy(() => import("../views/Home/Home"));
const Login = lazy(() => import("../views/Login/Login"));
const Settings = lazy(() => import("../views/Settings/Settings"));
const Signup = lazy(() => import("../views/Signup/Signup"));
const Album = lazy(() => import("../views/Album/Album"));
const Images = lazy(() => import("../views/Images/Images"));

/**
 * Interface defining a route object
 */
export interface RouteProps {
  /** Name of View to appear in header */
  viewName: string;
  /** Id of View. Should be same as key in the routes object */
  viewId: string;
  /** React Component to render in the layout */
  View: ComponentType<any>;
  /** React Router path */
  path: string;
  /** Whether to try to sessionId authenticate on page load */
  tryAuthenticate?: boolean;
  /** Redirect to login page if not authenticated */
  redirectOnAuthFail?: boolean;
  /** Query Cache Groups to make stale on page load */
  queryCacheGroups: QueryCacheGroups[];
}

/**
 * Universal routes map containing all pages for the site
 */
const routes: { [key: string]: RouteProps } = {
  Album: {
    viewId: "Album",
    viewName: "Album",
    View: Album,
    path: "/album/:id",
    tryAuthenticate: true,
    redirectOnAuthFail: true,
    queryCacheGroups: [
      QueryCacheGroups.GET_IMAGES_BY_ID_INFINITE,
      QueryCacheGroups.GET_ALBUM,
    ],
  },
  Home: {
    viewId: "Home",
    viewName: "Home",
    View: Home,
    path: "/home",
    tryAuthenticate: true,
    redirectOnAuthFail: true,
    queryCacheGroups: [QueryCacheGroups.GET_ALL_ALBUMS_INFINITE],
  },
  Login: {
    viewId: "Login",
    viewName: "Login",
    View: Login,
    path: "/login",
    queryCacheGroups: [],
  },
  Images: {
    viewId: "Images",
    viewName: "Pictures",
    View: Images,
    path: "/images",
    tryAuthenticate: true,
    redirectOnAuthFail: true,
    queryCacheGroups: [QueryCacheGroups.GET_ALL_IMAGES_INFINITE],
  },
  Settings: {
    viewId: "Settings",
    viewName: "Settings",
    View: Settings,
    path: "/settings",
    tryAuthenticate: true,
    redirectOnAuthFail: true,
    queryCacheGroups: [],
  },
  Signup: {
    viewId: "Signup",
    viewName: "Signup",
    View: Signup,
    path: "/signup",
    queryCacheGroups: [],
  },
  Root: {
    viewId: "Home",
    viewName: "Home",
    View: Home,
    path: "/",
    tryAuthenticate: true,
    redirectOnAuthFail: true,
    queryCacheGroups: [QueryCacheGroups.GET_ALL_ALBUMS_INFINITE],
  },
};

export default routes;
