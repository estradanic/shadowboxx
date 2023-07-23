import React, { useState } from "react";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import HomeIcon from "@material-ui/icons/Home";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import SettingsIcon from "@material-ui/icons/Settings";
import MenuIcon from "@material-ui/icons/Menu";
import InsertPhotoIcon from "@material-ui/icons/InsertPhoto";
import { makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import routes from "../../app/routes";
import { Strings } from "../../resources";
import ListItemLink from "../Link/ListItemLink";
import { useUserContext } from "../../contexts/UserContext";

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
  /** Whether screen is extra-small */
  collapse?: boolean;
}

/** Component to display a list of actions or pages for the app */
const AppMenuList = ({ collapse = false }: AppMenuListProps) => {
  const classes = useStyles();
  const { getLoggedInUser, updateLoggedInUser } = useUserContext();

  return (
    <List className={collapse ? "" : classes.horizontalList}>
      <ListItemLink to={routes.Home.path}>
        <ListItemIcon className={classes.listItemIcon}>
          <HomeIcon />
        </ListItemIcon>
        <ListItemText primary={Strings.label.home} />
      </ListItemLink>
      <ListItemLink to={routes.Pictures.path}>
        <ListItemIcon className={classes.listItemIcon}>
          <InsertPhotoIcon />
        </ListItemIcon>
        <ListItemText primary={Strings.label.pictures} />
      </ListItemLink>
      <ListItemLink to={routes.Settings.path}>
        <ListItemIcon className={classes.listItemIcon}>
          <SettingsIcon />
        </ListItemIcon>
        <ListItemText primary={Strings.label.settings} />
      </ListItemLink>
      <ListItemLink
        onClick={() => {
          getLoggedInUser().logout(updateLoggedInUser);
        }}
        to={routes.Login.path}
      >
        <ListItemIcon className={classes.listItemIcon}>
          <ExitToAppIcon />
        </ListItemIcon>
        <ListItemText primary={Strings.action.logout} />
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
        name="menu"
      >
        <MenuIcon />
      </IconButton>
      <SwipeableDrawer
        classes={{ paper: classes.drawer }}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
        anchor="right"
        open={drawerOpen}
        onClick={() => setDrawerOpen(false)}
      >
        <AppMenuList collapse={collapse} />
      </SwipeableDrawer>
    </>
  ) : (
    <AppMenuList />
  );
};

export default AppMenu;
