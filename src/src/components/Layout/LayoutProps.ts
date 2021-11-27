import React from "react";

/**
 * Interface defining props for a Layout
 */
export default interface LayoutProps {
  /** Key of the current route */
  viewId: string;
  /** Child Node */
  children: React.ReactNode;
}
