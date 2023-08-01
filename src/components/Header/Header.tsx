import React from "react";
import AppBar, { AppBarProps } from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Typography from "@material-ui/core/Typography";
import { makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import routes from "../../app/routes";
import { Strings } from "../../resources";
import Link from "../Link/Link";
import AppMenu from "../Menu/AppMenu";
import UserAvatar from "../User/UserAvatar";
import Notifications from "../Notifications/Notifications";
import classNames from "classnames";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../contexts/UserContext";
import useHideOnScroll from "../../hooks/useHideOnScroll";

type UseStylesParams = {
  xs: boolean;
};

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    transition: theme.transitions.create("top"),
  },
  visible: {
    top: 0,
  },
  hidden: {
    top: ({ xs }: UseStylesParams) => theme.spacing(xs ? -6.5 : -9),
  },
  loginButton: {
    marginLeft: "auto",
    marginRight: theme.spacing(1),
  },
  logo: {
    fontFamily: "Alex Brush",
    fontSize: ({ xs }: UseStylesParams) => (xs ? "xx-large" : "xxx-large"),
    marginRight: theme.spacing(3),
    "&:hover": {
      textDecoration: "none",
    },
  },
  profile: {
    marginLeft: theme.spacing(1),
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
  viewId: keyof typeof routes;
}

/**
 * Component to provide navigation and user info and functionality at the top of a page
 */
const Header = ({ viewId, className, ...rest }: HeaderProps) => {
  const theme = useTheme();
  const xs = useMediaQuery(theme.breakpoints.down("xs"));
  const classes = useStyles({ xs });
  const navigate = useNavigate();
  const { isUserLoggedIn, getLoggedInUser, profilePicture } = useUserContext();
  const visible = useHideOnScroll();

  return (
    <AppBar
      position="sticky"
      className={classNames(className, classes.header, {
        [classes.visible]: visible,
        [classes.hidden]: !visible,
      })}
    >
      <Toolbar className={classes.toolbar}>
        <Link className={classes.logo} to="/" color="inherit">
          {Strings.label.appName}
        </Link>
        {isUserLoggedIn ? (
          <AppMenu />
        ) : (
          <Button
            size={xs ? "small" : "medium"}
            className={classes.loginButton}
            variant="outlined"
            color="inherit"
            onClick={() => navigate(routes.Login.path)}
            name="login/signup"
          >
            {Strings.action.loginSignup}
          </Button>
        )}
      </Toolbar>
      <Toolbar variant="dense">
        <Typography variant="overline">{routes[viewId].viewName}</Typography>
        {isUserLoggedIn && (
          <>
            <Notifications className={classes.notifications} />
            {!!profilePicture?.id && (
              <UserAvatar
                UseUserInfoParams={{ user: getLoggedInUser() }}
                className={classes.profile}
              />
            )}
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
