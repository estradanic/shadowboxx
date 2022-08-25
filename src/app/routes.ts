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
  },
  Home: {
    viewId: "Home",
    viewName: "Home",
    View: Home,
    path: "/home",
    tryAuthenticate: true,
    redirectOnAuthFail: true,
  },
  Login: {
    viewId: "Login",
    viewName: "Login",
    View: Login,
    path: "/login",
  },
  Images: {
    viewId: "Images",
    viewName: "Pictures",
    View: Images,
    path: "/images",
    tryAuthenticate: true,
    redirectOnAuthFail: true,
  },
  Settings: {
    viewId: "Settings",
    viewName: "Settings",
    View: Settings,
    path: "/settings",
    tryAuthenticate: true,
    redirectOnAuthFail: true,
  },
  Signup: {
    viewId: "Signup",
    viewName: "Signup",
    View: Signup,
    path: "/signup",
  },
  Root: {
    viewId: "Home",
    viewName: "Home",
    View: Home,
    path: "/",
  },
};

export default routes;
