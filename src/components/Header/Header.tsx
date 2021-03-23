import React from "react";
import {
  AppBar,
  AppBarProps,
  Toolbar,
  Button,
  useMediaQuery,
  Typography,
} from "@material-ui/core";
import {makeStyles, Theme, useTheme} from "@material-ui/core/styles";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";
import Strings from "../../resources/Strings";
import {useNavigationContext} from "../../app/NavigationContext";
import {useUserContext} from "../../app/UserContext";
import Link from "../Link/Link";
import BackButton from "../Button/BackButton";
import AppMenu from "../Menu/AppMenu";
import {useHistory} from "react-router-dom";
import {UserAvatar} from "..";

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
    fontSize: ({xs}: any) => (xs ? "xx-large" : "xxx-large"),
    marginRight: theme.spacing(3),
    "&:hover": {
      textDecoration: "none",
    },
  },
  name: {
    marginLeft: "auto",
  },
  profile: {
    marginLeft: "auto",
    marginRight: theme.spacing(-1.5),
    marginBottom: theme.spacing(1),
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
 * @param param0
 * @returns
 */
const Header = ({viewId, ...rest}: HeaderProps) => {
  const theme = useTheme();
  const xs = useMediaQuery(theme.breakpoints.down("xs"));
  const classes = useStyles({xs});
  const {routeHistory} = useNavigationContext();
  const {loggedIn, firstName, lastName, profilePicture} = useUserContext();
  const history = useHistory();

  let showBackButton = false;
  if (routeHistory.length === 1) {
    showBackButton = routeHistory[0] !== viewId;
  } else if (routeHistory.length > 1) {
    showBackButton = routeHistory[1] !== viewId;
  }

  return (
    <header>
      <AppBar {...rest}>
        <Toolbar className={classes.toolbar}>
          <Link className={classes.logo} to="/" color="inherit">
            {Strings.appName()}
          </Link>
          {loggedIn ? (
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
          {loggedIn && (
            <>
              {profilePicture.src ? (
                <UserAvatar className={classes.profile} />
              ) : (
                <Typography
                  className={classes.name}
                  variant="overline"
                >{`${firstName} ${lastName}`}</Typography>
              )}
            </>
          )}
        </Toolbar>
      </AppBar>
    </header>
  );
};

export default Header;
