import React from "react";
import LayoutProps from "./LayoutProps";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const DefaultLayout = ({viewId, children}: LayoutProps) => (
  <>
    <Header viewId={viewId} position="sticky" />
    <div>{children}</div>
    <Footer />
  </>
);

export default DefaultLayout;
