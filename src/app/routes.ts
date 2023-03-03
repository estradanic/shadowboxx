import QueryCacheGroups from "../hooks/Query/QueryCacheGroups";

/** Union type of all the allowed Route ids */
export type RouteId =
  | "Album"
  | "ForgotPassword"
  | "Home"
  | "Login"
  | "Pictures"
  | "Settings"
  | "Signup"
  | "Share"
  | "VerifyEmail"
  | "Root";

/**
 * Interface defining a route object
 */
export interface RouteProps {
  /** Name of View to appear in header */
  viewName: string;
  /** Id of View. Should be same as key in the routes object */
  viewId: RouteId;
  /** React Router path */
  path: string;
  /** Whether to try to sessionId authenticate on page load */
  tryAuthenticate: boolean;
  /** Redirect to login page if not authenticated */
  redirectOnAuthFail: boolean;
  /** Query Cache Groups to make stale on page load */
  queryCacheGroups: QueryCacheGroups[];
}

/**
 * Universal routes map containing all pages for the site
 */
const routes = {
  Album: {
    viewId: "Album",
    viewName: "Album",
    path: "/album/:id",
    tryAuthenticate: true,
    redirectOnAuthFail: true,
    queryCacheGroups: [
      QueryCacheGroups.GET_IMAGES_BY_ID_INFINITE,
      QueryCacheGroups.GET_ALBUM,
    ],
  },
  ForgotPassword: {
    viewId: "ForgotPassword",
    viewName: "Forgot Password",
    path: "/forgot-password",
    tryAuthenticate: false,
    redirectOnAuthFail: false,
    queryCacheGroups: [],
  },
  Home: {
    viewId: "Home",
    viewName: "Home",
    path: "/home",
    tryAuthenticate: true,
    redirectOnAuthFail: true,
    queryCacheGroups: [QueryCacheGroups.GET_ALL_ALBUMS_INFINITE],
  },
  Login: {
    viewId: "Login",
    viewName: "Login",
    path: "/login",
    tryAuthenticate: false,
    redirectOnAuthFail: false,
    queryCacheGroups: [],
  },
  Pictures: {
    viewId: "Pictures",
    viewName: "Pictures",
    path: "/pictures",
    tryAuthenticate: true,
    redirectOnAuthFail: true,
    queryCacheGroups: [QueryCacheGroups.GET_ALL_IMAGES_INFINITE],
  },
  Settings: {
    viewId: "Settings",
    viewName: "Settings",
    path: "/settings",
    tryAuthenticate: true,
    redirectOnAuthFail: true,
    queryCacheGroups: [],
  },
  Share: {
    viewId: "Share",
    viewName: "Share",
    path: "/share",
    tryAuthenticate: true,
    redirectOnAuthFail: true,
    queryCacheGroups: [QueryCacheGroups.GET_ALL_MODIFYABLE_ALBUMS_INFINITE],
  },
  Signup: {
    viewId: "Signup",
    viewName: "Signup",
    path: "/signup",
    tryAuthenticate: false,
    redirectOnAuthFail: false,
    queryCacheGroups: [],
  },
  VerifyEmail: {
    viewId: "VerifyEmail",
    viewName: "Verify Email",
    path: "/verify",
    tryAuthenticate: false,
    redirectOnAuthFail: false,
    queryCacheGroups: [],
  },
  Root: {
    viewId: "Home",
    viewName: "Home",
    path: "/",
    tryAuthenticate: true,
    redirectOnAuthFail: true,
    queryCacheGroups: [QueryCacheGroups.GET_ALL_ALBUMS_INFINITE],
  },
} satisfies { [key in RouteId]: RouteProps };

export default routes;
