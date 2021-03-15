import React from "react";
import {routes, RouteProps} from "../../app/routes";
import {
  Typography,
  Breadcrumbs as MatBreadcrumbs,
  BreadcrumbsProps as MatBreadcrumbsProps,
  useMediaQuery,
} from "@material-ui/core";
import {makeStyles, Theme, useTheme} from "@material-ui/core/styles";
import Link from "../Link/Link";

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
  const classes = useStyles();
  const theme = useTheme();
  const xs = useMediaQuery(theme.breakpoints.down("xs"));

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
            to={breadcrumb.path}
          >
            {breadcrumb.viewName}
          </Link>
        ),
      )}
    </MatBreadcrumbs>
  );
};

export default Breadcrumbs;
