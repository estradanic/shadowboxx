import React from "react";
import {AppBar, AppBarProps, Toolbar, Button, Link, IconButton} from "@material-ui/core";
import {Person, Menu, ArrowBack} from "@material-ui/icons";
import {makeStyles, Theme} from "@material-ui/core/styles";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";
import Strings from "../../resources/Strings";

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
    fontSize: "xxx-large",
    marginRight: theme.spacing(3),
    textDecoration: "none",
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
  const classes = useStyles();

  return (
    <header>
      <AppBar {...rest}>
        <Toolbar className={classes.toolbar}>
          <Link className={classes.logo} href="/" color="inherit">
            {Strings.appName()}
          </Link>
          <Button size="small" className={classes.loginButton} variant="outlined" color="inherit" startIcon={<Person />}>{Strings.login()}</Button>
          <IconButton color="inherit"><Menu /></IconButton>
        </Toolbar>
        <Toolbar variant="dense">
          <Button className={classes.backButton} variant="outlined" color="inherit" size="small" startIcon={<ArrowBack />}>{Strings.back()}</Button>
          <Breadcrumbs viewId={viewId} />
        </Toolbar>
      </AppBar>
    </header>
  );
};

export default Header;
