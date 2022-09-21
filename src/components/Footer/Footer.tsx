import React, { useState } from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { makeStyles, Theme } from "@material-ui/core/styles";
import classNames from "classnames";
import { Strings } from "../../resources";
import { useSnackbar } from "../Snackbar";
import { useHideOnScroll } from "../../hooks";
import Offline from "../NetworkDetector/Offline";
import Online from "../NetworkDetector/Online";

const useStyles = makeStyles((theme: Theme) => ({
  footer: {
    transition: theme.transitions.create("bottom"),
  },
  visible: {
    bottom: 0,
  },
  hidden: {
    bottom: theme.spacing(-8),
  },
  centeredText: {
    margin: "auto",
  },
  installLabel: {
    marginRight: "auto",
  },
  installButton: {
    marginLeft: "auto",
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  },
  offlineIndicator: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
}));

interface BeforeInstallPromptEvent extends Event {
  /**
   * Returns an array of DOMString items containing the platforms on which the event was dispatched.
   * This is provided for user agents that want to present a choice of versions to the user such as,
   * for example, "web" or "play" which would allow the user to chose between a web version or
   * an Android version.
   */
  readonly platforms: Array<string>;

  /**
   * Returns a Promise that resolves to a DOMString containing either "accepted" or "dismissed".
   */
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;

  /**
   * Allows a developer to show the install prompt at a time of their own choosing.
   * This method returns a Promise.
   */
  readonly prompt: () => Promise<void>;
}

/**
 * Component to display info at the bottom of a page
 */
const Footer = () => {
  const classes = useStyles();
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent>();
  const [showInstallPrompt, setShowInstallPrompt] = useState<boolean>();
  const visible = useHideOnScroll();

  const { enqueueSuccessSnackbar, enqueueErrorSnackbar } = useSnackbar();

  window.addEventListener("beforeinstallprompt", (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so that it can be triggered later
    setInstallPrompt(e as BeforeInstallPromptEvent);
    setShowInstallPrompt(true);
  });

  const install = async () => {
    setShowInstallPrompt(false);
    installPrompt!.prompt();
    const { outcome } = await installPrompt!.userChoice;
    if (outcome === "accepted") {
      enqueueSuccessSnackbar(Strings.installed());
    } else {
      enqueueErrorSnackbar(Strings.notInstalled());
    }
  };

  return (
    <AppBar
      position="sticky"
      color="primary"
      component="footer"
      className={classNames(classes.footer, {
        [classes.visible]: visible,
        [classes.hidden]: !visible,
      })}
    >
      <Online>
        <Toolbar variant="dense">
          {showInstallPrompt ? (
            <>
              <Typography className={classes.installLabel} variant="overline">
                {Strings.installPrompt()}
              </Typography>
              <Button
                className={classes.installButton}
                onClick={install}
                variant="contained"
                size="small"
              >
                {Strings.install()}
              </Button>
            </>
          ) : (
            <Typography className={classes.centeredText} color="inherit">
              {Strings.copyright()}
            </Typography>
          )}
        </Toolbar>
      </Online>
      <Offline>
        <Toolbar variant="dense" className={classes.offlineIndicator}>
          <Typography className={classes.centeredText}>
            {Strings.offline()}
          </Typography>
        </Toolbar>
      </Offline>
    </AppBar>
  );
};

export default Footer;
