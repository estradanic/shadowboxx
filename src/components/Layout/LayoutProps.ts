import React, { ReactNode } from "react";
import routes from "../../app/routes";

/**
 * Interface defining props for a Layout
 */
export default interface LayoutProps {
  /** Key of the current route */
  viewId: keyof typeof routes;
  /** Child Node */
  children: ReactNode;
}
