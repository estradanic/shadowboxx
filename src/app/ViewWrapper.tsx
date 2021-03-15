import React, {memo, useEffect} from "react";
import {RouteProps} from "./routes";
import {Route} from "react-router-dom";
import {useNavigationContext} from "./NavigationContext";

const ViewWrapper = memo(
  ({
    viewId,
    view,
    path,
    layout = "DefaultLayout",
    exact = true,
  }: RouteProps) => {
    const Layout = require(`../components/Layout/${layout}`).default;

    const {routeHistory, setRouteHistory} = useNavigationContext();
    useEffect(() => {
      const newRouteHistory = routeHistory;
      if (viewId !== routeHistory[0]) {
        newRouteHistory.splice(0, 0, viewId);
      }
      setRouteHistory(newRouteHistory);
    });

    return (
      <>
        <Layout viewId={viewId}>
          <Route path={path} component={view} exact={exact} />
        </Layout>
      </>
    );
  },
);

export default ViewWrapper;
