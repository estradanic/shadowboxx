import React from "react";
import {routes, RouteProps} from "../../app/routes";
import {
  Typography,
  Link,
  Breadcrumbs as MatBreadcrumbs,
} from "@material-ui/core";
import Strings from "../../resources/Strings";

export interface BreadcrumbsProps {
  viewId: string;
}

const getBreadcrumbs = (viewId: string = ""): RouteProps[] => {
  if (viewId) {
    return [...getBreadcrumbs(routes[viewId].parentKey), routes[viewId]];
  } else {
    return [];
  }
};

const Breadcrumbs = ({viewId}: BreadcrumbsProps) => {
  const breadcrumbs = getBreadcrumbs(viewId);

  return (
    <MatBreadcrumbs color="inherit" separator="‣">
      <Link href="/" color="inherit">
        {Strings.appName}
      </Link>
      {breadcrumbs.map((breadcrumb, i) =>
        i === breadcrumbs.length - 1 ? (
          <Typography
            key={`breadcrumb${breadcrumb.viewId}`}
            variant="h6"
            color="inherit"
          >
            {breadcrumb.viewName}
          </Typography>
        ) : (
          <Link
            key={`breadcrumb${breadcrumb.viewId}`}
            color="inherit"
            href={breadcrumb.path}
          >
            {breadcrumb.viewName}
          </Link>
        ),
      )}
    </MatBreadcrumbs>
  );
};

export default Breadcrumbs;
