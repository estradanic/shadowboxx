import React from "react";
import {RouteProps} from "./routes";
import {Route} from "react-router-dom";

const ViewWrapper = ({
  viewId,
  view,
  path,
  layout = "DefaultLayout",
  exact = true,
}: RouteProps) => {
  const Layout = require(`../components/Layout/${layout}`).default;

  return (
    <>
      <Layout viewId={viewId}>
        <Route path={path} component={view} exact={exact} />
      </Layout>
    </>
  );
};

export default ViewWrapper;
