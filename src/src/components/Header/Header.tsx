import React, { useEffect, useState } from "react";
import {
  AppBar,
  AppBarProps,
  Toolbar,
  Button,
  useMediaQuery,
  Typography,
} from "@material-ui/core";
import { makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";
import Strings from "../../resources/Strings";
import { useNavigationContext } from "../../app/NavigationContext";
import Link from "../Link/Link";
import BackButton from "../Button/BackButton";
import AppMenu from "../Menu/AppMenu";
import { useHistory } from "react-router-dom";
import { UserAvatar } from "..";
import { useRoutes } from "../../app/routes";
import Notifications from "../Notifications/Notifications";
import Parse from "parse";

const useStyles = makeStyles((theme: Theme) => ({
  backButton: {
    marginRight: theme.spacing(3),
  },
  loginButton: {
    marginLeft: "auto",
    marginRight: theme.spacing(1),
  },
  logo: {
    fontFamily: "Alex Brush",
    fontSize: ({ xs }: any) => (xs ? "xx-large" : "xxx-large"),
    marginRight: theme.spacing(3),
    "&:hover": {
      textDecoration: "none",
    },
  },
  profile: {
    marginRight: theme.spacing(-1.5),
    marginBottom: theme.spacing(1),
  },
  notifications: {
    marginLeft: "auto",
  },
  toolbar: {
    paddingRight: 0,
  },
}));

/**
 * Interface defining props for Header
 */
export interface HeaderProps extends AppBarProps {
  /** Key for the current route */
  viewId: string;
}

/**
 * Component to provide navigation and user info and functionality at the top of a page
 */
const Header = ({ viewId, ...rest }: HeaderProps) => {
  const theme = useTheme();
  const xs = useMediaQuery(theme.breakpoints.down("xs"));
  const classes = useStyles({ xs });
  const { routeHistory } = useNavigationContext();
  const history = useHistory();
  const [showBackButton, setShowBackButton] = useState(false);
  const { routes } = useRoutes();

  useEffect(() => {
    if (routeHistory.length === 1) {
      setShowBackButton(
        routeHistory[0] !== viewId && !!routes[routeHistory[0]]?.tryAuthenticate
      );
    } else if (routeHistory.length > 1) {
      setShowBackButton(
        routeHistory[1] !== viewId && !!routes[routeHistory[1]]?.tryAuthenticate
      );
    }
  }, [routeHistory.length, routeHistory, viewId, routes]);

  return (
    <header>
      <AppBar {...rest}>
        <Toolbar className={classes.toolbar}>
          <Link className={classes.logo} to="/" color="inherit">
            {Strings.appName()}
          </Link>
          {Parse.User.current() ? (
            <AppMenu />
          ) : (
            <Button
              size={xs ? "small" : "medium"}
              className={classes.loginButton}
              variant="outlined"
              color="inherit"
              onClick={() => history.push("/login")}
            >
              {Strings.loginSignup()}
            </Button>
          )}
        </Toolbar>
        <Toolbar variant="dense">
          {showBackButton && (
            <BackButton
              className={classes.backButton}
              variant="outlined"
              color="inherit"
              size="small"
            />
          )}
          <Breadcrumbs viewId={viewId} />
          {Parse.User.current() && (
            <>
              <Notifications className={classes.notifications} />
              {Parse.User.current()?.get("profilePicture")?.url() ? (
                <UserAvatar className={classes.profile} />
              ) : (
                <Typography variant="overline">{`${Parse.User.current()?.get(
                  "firstName"
                )} ${Parse.User.current()?.get("lastName")}`}</Typography>
              )}
            </>
          )}
        </Toolbar>
      </AppBar>
    </header>
  );
};

export default Header;
