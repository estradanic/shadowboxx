import React, {memo} from "react";
import {RouteProps} from "./routes";
import {Route} from "react-router-dom";
import {useNavigationContext} from "./NavigationContext";

const ViewWrapper = memo(({
  viewId,
  view,
  path,
  layout = "DefaultLayout",
  exact = true,
}: RouteProps) => {
  const Layout = require(`../components/Layout/${layout}`).default;

  const {prevRoutes, setPrevRoutes} = useNavigationContext();
  const newPrevRoutes = prevRoutes;
  if (viewId !== prevRoutes[0]) {
    newPrevRoutes.splice(0, 0, viewId);
  }
  setPrevRoutes(newPrevRoutes);

  return (
    <>
      <Layout viewId={viewId}>
        <Route path={path} component={view} exact={exact} />
      </Layout>
    </>
  );
});

export default ViewWrapper;
