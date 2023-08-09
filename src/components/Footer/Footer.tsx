import React, { useState, useEffect } from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { makeStyles, Theme } from "@material-ui/core/styles";
import classNames from "classnames";
import { Strings } from "../../resources";
import { useSnackbar } from "../Snackbar";
import Offline from "../NetworkDetector/Offline";
import Online from "../NetworkDetector/Online";
import useHideOnScroll from "../../hooks/useHideOnScroll";
import { useJobContext } from "../../contexts/JobContext";

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
  jobs: {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
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
  const { jobCount } = useJobContext();

  const { enqueueSuccessSnackbar, enqueueErrorSnackbar } = useSnackbar();

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so that it can be triggered later
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    });
  }, [setInstallPrompt, setShowInstallPrompt]);

  const install = async () => {
    setShowInstallPrompt(false);
    installPrompt!.prompt();
    const { outcome } = await installPrompt!.userChoice;
    if (outcome === "accepted") {
      enqueueSuccessSnackbar(Strings.success.installed);
    } else {
      enqueueErrorSnackbar(Strings.error.notInstalled);
    }
  };

  const footerText =
    jobCount > 0 ? Strings.label.jobs(jobCount) : Strings.label.copyright;

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
        <Toolbar
          variant="dense"
          className={classNames({ [classes.jobs]: jobCount > 0 })}
        >
          {showInstallPrompt ? (
            <>
              <Typography className={classes.installLabel} variant="overline">
                {Strings.prompt.installPrompt}
              </Typography>
              <Button
                className={classes.installButton}
                onClick={install}
                variant="contained"
                size="small"
              >
                {Strings.action.install}
              </Button>
            </>
          ) : (
            <Typography
              className={classes.centeredText}
              color="inherit"
              variant="overline"
            >
              {footerText}
            </Typography>
          )}
        </Toolbar>
      </Online>
      <Offline>
        <Toolbar variant="dense" className={classes.offlineIndicator}>
          <Typography className={classes.centeredText} variant="overline">
            {Strings.message.offline}
          </Typography>
        </Toolbar>
      </Offline>
    </AppBar>
  );
};

export default Footer;
