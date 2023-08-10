import { ComponentType, lazy } from "react";
import { RouteId } from "./routes";

// Lazy importing these to allow code-splitting
const Home = lazy(() => import("../views/Home/Home"));
const Login = lazy(() => import("../views/Login/Login"));
const Settings = lazy(() => import("../views/Settings/Settings"));
const Signup = lazy(() => import("../views/Signup/Signup"));
const Album = lazy(() => import("../views/Album/Album"));
const Memories = lazy(() => import("../views/Memories/Memories"));
const Share = lazy(() => import("../views/Share/Share"));
const VerifyEmail = lazy(() => import("../views/VerifyEmail/VerifyEmail"));
const ForgotPassword = lazy(
  () => import("../views/ForgotPassword/ForgotPassword")
);

const routeComponents: Record<RouteId, ComponentType<any>> = {
  Album,
  ForgotPassword,
  Home,
  Login,
  Memories,
  Settings,
  Signup,
  Share,
  VerifyEmail,
  Root: Home,
};

export default routeComponents;
