import { ComponentType } from "react";
import { lazy } from "react";

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
  /** Name of view to appear in header */
  viewName: string;
  /** Id of view. Should be same as key in the routes object */
  viewId: string;
  /** React Component to render in the layout */
  view: ComponentType<any>;
  /** React Router path */
  path: string;
  /** What layout to use for this route. Defaults to DefaultLayout */
  layout?: string;
  /** Does path have to match exactly */
  exact?: boolean;
  /** Whether to try to sessionId authenticate on page load */
  tryAuthenticate?: boolean;
  /** Redirect to login page if not authenticated */
  redirectOnAuthFail?: boolean;
}

/**
 * Universal routes map containing all pages for the site
 */
const routes: { [key: string]: RouteProps } = {
  Album: {
    viewId: "Album",
    viewName: "Album",
    view: Album,
    path: "/album/:id",
    tryAuthenticate: true,
    redirectOnAuthFail: true,
  },
  Home: {
    viewId: "Home",
    viewName: "Home",
    view: Home,
    path: "/home",
    tryAuthenticate: true,
  },
  Login: {
    viewId: "Login",
    viewName: "Login",
    view: Login,
    path: "/login",
  },
  Images: {
    viewId: "Images",
    viewName: "Pictures",
    view: Images,
    path: "/images",
    tryAuthenticate: true,
    redirectOnAuthFail: true,
  },
  Settings: {
    viewId: "Settings",
    viewName: "Settings",
    view: Settings,
    path: "/settings",
    tryAuthenticate: true,
    redirectOnAuthFail: true,
  },
  Signup: {
    viewId: "Signup",
    viewName: "Signup",
    view: Signup,
    path: "/signup",
  },
  Root: {
    viewId: "Home",
    viewName: "Home",
    view: Home,
    path: "/",
  },
};

export default routes;
