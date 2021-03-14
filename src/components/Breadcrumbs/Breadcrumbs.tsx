import React from "react";
import {routes, RouteProps} from "../../app/routes";
import {
  Typography,
  Link,
  Breadcrumbs as MatBreadcrumbs,
} from "@material-ui/core";
import {Panorama} from "@material-ui/icons";
import {makeStyles, Theme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  logo: {
    backgroundColor: "green",
    borderRadius: "30%",
  },
}));

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
  const classes = useStyles();

  const breadcrumbs = getBreadcrumbs(viewId);

  return (
    <MatBreadcrumbs color="inherit" separator="‣">
      <Link href="/" color="inherit">
        <Panorama className={classes.logo} fontSize="large" />
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
