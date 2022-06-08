import React from "react";
import { useRoutes, RouteProps } from "../../app/routes";
import {
  Typography,
  Breadcrumbs as MatBreadcrumbs,
  BreadcrumbsProps as MatBreadcrumbsProps,
  useMediaQuery,
} from "@material-ui/core";
import { makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import Link from "../Link/Link";
import { useNavigationContext } from "../../app/NavigationContext";

const useStyles = makeStyles((theme: Theme) => ({
  breadcrumbs: {
    "& *": {
      color: "inherit",
      backgroundColor: "inherit",
    },
    "& li:hover, & li:focus, & li:active": {
      backgroundColor: "inherit",
      color: "inherit",
    },
    "& svg:hover": {
      backdropFilter: "brightness(120%)",
      borderRadius: theme.spacing(0.5),
    },
  },
}));

/**
 * Interface defining props for Breadcrumbs
 */
export interface BreadcrumbsProps extends MatBreadcrumbsProps {
  /** Key of the current route */
  viewId: string;
}

const getBreadcrumbs = (
  viewId: string = "",
  routes: { [key: string]: RouteProps }
): RouteProps[] => {
  if (viewId) {
    return [
      ...getBreadcrumbs(routes[viewId].parentKey, routes),
      routes[viewId],
    ];
  } else {
    return [];
  }
};

/**
 * Component to allow easy hierarchical navigation of the site
 */
const Breadcrumbs = ({ viewId, ...rest }: BreadcrumbsProps) => {
  const { routes, getRoutePath } = useRoutes();
  const classes = useStyles();
  const theme = useTheme();
  const xs = useMediaQuery(theme.breakpoints.down("xs"));
  const { routeParams } = useNavigationContext();

  const breadcrumbs = getBreadcrumbs(viewId, routes);

  return (
    <MatBreadcrumbs
      maxItems={xs ? 2 : 5}
      aria-label="breadcrumb"
      color="inherit"
      separator="‣"
      className={classes.breadcrumbs}
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
            to={getRoutePath(
              { viewId: breadcrumb.viewId, search: "" },
              routeParams
            )}
          >
            {breadcrumb.viewName}
          </Link>
        )
      )}
    </MatBreadcrumbs>
  );
};

export default Breadcrumbs;
