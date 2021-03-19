import React, {useState} from "react";
import {
  AppBar,
  AppBarProps,
  Toolbar,
  Button,
  IconButton,
  SwipeableDrawer,
  List,
  ListItemIcon,
  useMediaQuery,
  ListItemText,
} from "@material-ui/core";
import {Menu, ArrowBack, Home, ExitToApp} from "@material-ui/icons";
import {makeStyles, Theme, useTheme} from "@material-ui/core/styles";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";
import Strings from "../../resources/Strings";
import {useNavigationContext} from "../../app/NavigationContext";
import {useUserContext} from "../../app/UserContext";
import Link from "../Link/Link";
import ListItemLink from "../Link/ListItemLink";
import {useHistory} from "react-router-dom";

const useStyles = makeStyles((theme: Theme) => ({
  backButton: {
    marginRight: theme.spacing(3),
  },
  drawer: {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
    width: "40%",
    paddingTop: theme.spacing(2),
  },
  listItemIcon: {
    color: theme.palette.primary.contrastText,
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
  menuButton: {
    marginLeft: "auto",
    marginRight: theme.spacing(1),
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
  const {routeHistory, navigateBack} = useNavigationContext();
  const {loggedIn, logout} = useUserContext();
  const history = useHistory();

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

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
            <>
              <IconButton
                onClick={() => setDrawerOpen(true)}
                className={classes.menuButton}
                color="inherit"
              >
                <Menu />
              </IconButton>
              <SwipeableDrawer
                classes={{paper: classes.drawer}}
                onClose={() => setDrawerOpen(false)}
                onOpen={() => setDrawerOpen(true)}
                anchor="right"
                open={drawerOpen}
              >
                <List>
                  <ListItemLink to="/">
                    <ListItemIcon className={classes.listItemIcon}>
                      <Home color="inherit" />
                    </ListItemIcon>
                    <ListItemText primary={Strings.home()} />
                  </ListItemLink>
                  <ListItemLink onClick={logout} to="/login">
                    <ListItemIcon className={classes.listItemIcon}>
                      <ExitToApp />
                    </ListItemIcon>
                    <ListItemText primary={Strings.logout()} />
                  </ListItemLink>
                </List>
              </SwipeableDrawer>
            </>
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
            <Button
              className={classes.backButton}
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<ArrowBack />}
              onClick={navigateBack}
            >
              {Strings.back()}
            </Button>
          )}
          <Breadcrumbs viewId={viewId} />
        </Toolbar>
      </AppBar>
    </header>
  );
};

export default Header;
