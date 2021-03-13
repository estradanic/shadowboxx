import {ComponentType} from "react";
import {Home, About} from "../views";

export interface RouteProps {
  viewId: string;
  view: ComponentType<any>;
  path: string;
  parentKey?: string;
  layout?: string;
  exact?: boolean;
}

export const routes: {[key: string]: RouteProps} = {
  About: {
    viewId: "About",
    view: About,
    path: "/about",
  },
  Home: {
    viewId: "Home",
    view: Home,
    path: "/home",
  },
  Root: {
    viewId: "Home",
    view: Home,
    path: "/",
  },
};
