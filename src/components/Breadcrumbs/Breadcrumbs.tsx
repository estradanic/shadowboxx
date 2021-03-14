import React from "react";
import {routes, RouteProps} from "../../app/routes";
import {
  Typography,
  Link,
  Breadcrumbs as MatBreadcrumbs,
  BreadcrumbsProps as MatBreadcrumbsProps,
} from "@material-ui/core";

export interface BreadcrumbsProps extends MatBreadcrumbsProps {
  viewId: string;
}

const getBreadcrumbs = (viewId: string = ""): RouteProps[] => {
  if (viewId) {
    return [...getBreadcrumbs(routes[viewId].parentKey), routes[viewId]];
  } else {
    return [];
  }
};

const Breadcrumbs = ({viewId, ...rest}: BreadcrumbsProps) => {
  const breadcrumbs = getBreadcrumbs(viewId);

  return (
    <MatBreadcrumbs
      aria-label="breadcrumb"
      color="inherit"
      separator="‣"
      {...rest}
    >
      {breadcrumbs.map((breadcrumb, i) =>
        i === breadcrumbs.length - 1 ? (
          <Typography
            key={`breadcrumb${breadcrumb.viewId}`}
            variant="overline"
            color="inherit"
          >
            {breadcrumb.viewName}
          </Typography>
        ) : (
          <Link
            variant="overline"
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
