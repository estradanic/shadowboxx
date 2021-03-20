import React, {useState} from "react";
import {
  IconButton,
  SwipeableDrawer,
  List,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import {Home, ExitToApp, Settings, Menu} from "@material-ui/icons";
import ListItemLink from "../Link/ListItemLink";
import {makeStyles, Theme} from "@material-ui/core/styles";
import Strings from "../../resources/Strings";
import {useUserContext} from "../../app/UserContext";

const useStyles = makeStyles((theme: Theme) => ({
  drawer: {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
    width: "40%",
    paddingTop: theme.spacing(2),
  },
  listItemIcon: {
    color: theme.palette.primary.contrastText,
  },
  menuButton: {
    marginLeft: "auto",
    marginRight: theme.spacing(1),
  },
}));

const AppMenu = () => {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const {logout} = useUserContext();
  const classes = useStyles();

  return (
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
              <Home />
            </ListItemIcon>
            <ListItemText primary={Strings.home()} />
          </ListItemLink>
          <ListItemLink to="/settings">
            <ListItemIcon className={classes.listItemIcon}>
              <Settings />
            </ListItemIcon>
            <ListItemText primary={Strings.settings()} />
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
  );
};

export default AppMenu;
