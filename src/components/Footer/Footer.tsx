import React from "react";
import {AppBar, Toolbar, Typography} from "@material-ui/core";
import {makeStyles, Theme} from "@material-ui/core/styles";
import Strings from "../../resources/Strings";

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    // height: theme.spacing(3),
    top: "auto",
    bottom: 0,
  },
  copyright: {
    margin: "auto",
  },
}));

/**
 * Component to display info at the bottom of a page
 * @returns
 */
const Footer = () => {
  const classes = useStyles();

  return (
    <footer>
      <AppBar position="fixed" color="primary" className={classes.appBar}>
        <Toolbar variant="dense">
          <Typography className={classes.copyright} color="inherit">
            {Strings.copyright()}
          </Typography>
        </Toolbar>
      </AppBar>
    </footer>
  );
};

export default Footer;
