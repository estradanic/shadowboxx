import React from "react";
import AppBar, { AppBarProps } from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Typography from "@material-ui/core/Typography";
import { makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import { useNavigate, useLocation, Location } from "react-router-dom";
import { routes } from "../../app";
import { Strings } from "../../resources";
import { useUserContext } from "../../contexts";
import Link from "../Link/Link";
import BackButton from "../Button/BackButton";
import AppMenu from "../Menu/AppMenu";
import UserAvatar from "../User/UserAvatar";
import Notifications from "../Notifications/Notifications";

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
  viewId: string;
}

/**
 * Component to provide navigation and user info and functionality at the top of a page
 */
const Header = ({ viewId, ...rest }: HeaderProps) => {
  const theme = useTheme();
  const xs = useMediaQuery(theme.breakpoints.down("xs"));
  const classes = useStyles({ xs });
  const navigate = useNavigate();
  const location = useLocation() as { state: { previousLocation?: Location } };
  const { isUserLoggedIn, getLoggedInUser, profilePicture } = useUserContext();

  return (
    <header>
      <AppBar {...rest}>
        <Toolbar className={classes.toolbar}>
          <Link className={classes.logo} to="/" color="inherit">
            {Strings.appName()}
          </Link>
          {isUserLoggedIn ? (
            <AppMenu />
          ) : (
            <Button
              size={xs ? "small" : "medium"}
              className={classes.loginButton}
              variant="outlined"
              color="inherit"
              onClick={() => navigate("/login")}
              name="login/signup"
            >
              {Strings.loginSignup()}
            </Button>
          )}
        </Toolbar>
        <Toolbar variant="dense">
          {!!location.state?.previousLocation && (
            <BackButton
              className={classes.backButton}
              variant="outlined"
              color="inherit"
              size="small"
            />
          )}
          <Typography variant="overline">{routes[viewId].viewName}</Typography>
          {isUserLoggedIn && (
            <>
              <Notifications className={classes.notifications} />
              <Typography variant="overline">{`${getLoggedInUser().firstName} ${
                getLoggedInUser().lastName
              }`}</Typography>
              {!!profilePicture?.thumbnail?.url() && (
                <UserAvatar
                  email={getLoggedInUser().email}
                  className={classes.profile}
                />
              )}
            </>
          )}
        </Toolbar>
      </AppBar>
    </header>
  );
};

export default Header;