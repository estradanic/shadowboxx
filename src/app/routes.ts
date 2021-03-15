import {ComponentType} from "react";
import {Home, About} from "../views";

export interface RouteProps {
  viewName: string;
  viewId: string;
  view: ComponentType<any>;
  path: string;
  parentKey?: string;
  layout?: string;
  exact?: boolean;
}

export const routes: {[key: string]: RouteProps} = {
  AboutChild3: {
    viewId: "AboutChild3",
    viewName: "Hola",
    view: About,
    path: "/about/child/child2/child3",
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
  Root: {
    viewId: "Root",
    viewName: "Home",
    view: Home,
    path: "/",
  },
};
