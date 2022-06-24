import React, { useState } from "react";
import {
  IconButton,
  SwipeableDrawer,
  List,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
} from "@material-ui/core";
import {
  Home,
  ExitToApp,
  Settings,
  Menu,
  InsertPhoto,
} from "@material-ui/icons";
import { makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import { routes } from "../../app";
import { Strings } from "../../resources";
import { useUserContext } from "../../contexts";
import ListItemLink from "../Link/ListItemLink";

const useStyles = makeStyles((theme: Theme) => ({
  drawer: {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
    width: "40%",
    paddingTop: theme.spacing(2),
  },
  listItemIcon: {
    color: theme.palette.primary.contrastText,
    minWidth: theme.spacing(4),
  },
  menuButton: {
    marginLeft: "auto",
    marginRight: theme.spacing(1),
  },
  horizontalList: {
    display: "flex",
    flexDirection: "row",
    padding: 0,
    marginLeft: "auto",
    marginBottom: theme.spacing(1),
  },
}));

/** Interface defining props for AppMenuList */
export interface AppMenuListProps {
  /** Whether screen is extra-small or not */
  collapse?: boolean;
}

/** Component to display a list of actions or pages for the app */
const AppMenuList = ({ collapse = false }: AppMenuListProps) => {
  const classes = useStyles();
  const { loggedInUser, updateLoggedInUser } = useUserContext();

  return (
    <List className={collapse ? "" : classes.horizontalList}>
      <ListItemLink to={routes["Home"].path}>
        <ListItemIcon className={classes.listItemIcon}>
          <Home />
        </ListItemIcon>
        <ListItemText primary={Strings.home()} />
      </ListItemLink>
      <ListItemLink to={routes["Images"].path}>
        <ListItemIcon className={classes.listItemIcon}>
          <InsertPhoto />
        </ListItemIcon>
        <ListItemText primary={Strings.pictures()} />
      </ListItemLink>
      <ListItemLink to={routes["Settings"].path}>
        <ListItemIcon className={classes.listItemIcon}>
          <Settings />
        </ListItemIcon>
        <ListItemText primary={Strings.settings()} />
      </ListItemLink>
      <ListItemLink
        onClick={() => {
          loggedInUser?.logout(updateLoggedInUser);
        }}
        to={routes["Login"].path}
      >
        <ListItemIcon className={classes.listItemIcon}>
          <ExitToApp />
        </ListItemIcon>
        <ListItemText primary={Strings.logout()} />
      </ListItemLink>
    </List>
  );
};

/** Component to display a menu of options or pages for the app */
const AppMenu = () => {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const classes = useStyles();
  const theme = useTheme();
  const collapse = useMediaQuery(theme.breakpoints.down("sm"));

  return collapse ? (
    <>
      <IconButton
        onClick={() => setDrawerOpen(true)}
        className={classes.menuButton}
        color="inherit"
      >
        <Menu />
      </IconButton>
      <SwipeableDrawer
        classes={{ paper: classes.drawer }}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
        anchor="right"
        open={drawerOpen}
      >
        <AppMenuList collapse={collapse} />
      </SwipeableDrawer>
    </>
  ) : (
    <AppMenuList />
  );
};

export default AppMenu;
