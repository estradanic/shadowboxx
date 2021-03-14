import React from "react";
import LayoutProps from "./LayoutProps";
import Header from "../Header/Header";

const DefaultLayout = ({viewId, children}: LayoutProps) => (
  <>
    <Header viewId={viewId} position="sticky" />
    <div>{children}</div>
  </>
);

export default DefaultLayout;
