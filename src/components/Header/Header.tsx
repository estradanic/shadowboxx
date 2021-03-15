import React from "react";
import {
  AppBar,
  AppBarProps,
  Toolbar,
  Button,
  IconButton,
  useMediaQuery,
} from "@material-ui/core";
import {Menu, ArrowBack} from "@material-ui/icons";
import {makeStyles, Theme, useTheme} from "@material-ui/core/styles";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";
import Strings from "../../resources/Strings";
import {useNavigationContext} from "../../app/NavigationContext";
import {useUserContext} from "../../app/UserContext";
import Link from "../Link/Link";
import {useHistory} from "react-router-dom";
import {routes} from "../../app/routes";

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
    fontSize: ({xs}: any) => xs ? "xx-large" : "xxx-large",
    marginRight: theme.spacing(3),
    "&:hover": {
      textDecoration: "none",
    },
  },
  toolbar: {
    paddingRight: 0,
  },
}));

export interface HeaderProps extends AppBarProps {
  viewId: string;
}

const Header = ({viewId, ...rest}: HeaderProps) => {
  const theme = useTheme();
  const xs = useMediaQuery(theme.breakpoints.down("xs"));
  const classes = useStyles({xs});
  const {prevRoutes, setPrevRoutes} = useNavigationContext();
  const {loggedIn} = useUserContext();
  const history = useHistory();

  const navigateBack = () => {
    const newPrevRoutes = prevRoutes;
    newPrevRoutes.shift();
    setPrevRoutes(newPrevRoutes);
    history.push(routes[newPrevRoutes[0]].path);
  }

  return (
    <header>
      <AppBar {...rest}>
        <Toolbar className={classes.toolbar}>
          <Link className={classes.logo} to="/" color="inherit">
            {Strings.appName()}
          </Link>
          {
            loggedIn ?
              <IconButton color="inherit">
                <Menu />
              </IconButton> :
              <Button
                size={xs ? "small" : "medium"}
                className={classes.loginButton}
                variant="outlined"
                color="inherit"
              >
                {Strings.login()}
              </Button>
          }
        </Toolbar>
        <Toolbar variant="dense">
          {prevRoutes[1] && prevRoutes[1] !== viewId && (
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
