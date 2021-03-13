import React from "react";
import LayoutProps from "./LayoutProps";

const DefaultLayout = ({viewId, children}: LayoutProps) => (
  <>
    <div>
      <h1>{viewId}</h1>
    </div>
    <div>{children}</div>
  </>
);

export default DefaultLayout;
