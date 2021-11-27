import React from "react";
import {
  SnackbarProvider as NotistackSnackbarProvider,
  SnackbarProviderProps as NotistackSnackbarProviderProps,
  useSnackbar as notistackUseSnackbar,
} from "notistack";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { Error, Check, Warning, Info } from "@material-ui/icons";
import { Typography } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) => ({
  variantSuccess: {
    backgroundColor: `${theme.palette.success.main} !important`,
    color: `${theme.palette.success.contrastText} !important`,
  },
  variantInfo: {
    backgroundColor: `${theme.palette.info.main} !important`,
    color: `${theme.palette.info.contrastText} !important`,
  },
  variantWarning: {
    backgroundColor: `${theme.palette.warning.main} !important`,
    color: `${theme.palette.warning.contrastText} !important`,
  },
  variantError: {
    backgroundColor: `${theme.palette.error.main} !important`,
    color: `${theme.palette.error.contrastText} !important`,
  },
  message: {
    "& *:nth-child(1)": {
      marginRight: theme.spacing(2),
    },
  },
  collapseContainer: {
    minWidth: 0,
    width: "fit-content",
  },
}));

/** Hook providing easy access to enqueuing different kinds of Snackbars */
export const useSnackbar = () => {
  const { enqueueSnackbar } = notistackUseSnackbar();
  const classes = useStyles();

  const enqueueSuccessSnackbar = (message: string) => {
    enqueueSnackbar(<Typography>{message}</Typography>, {
      variant: "success",
      className: classes.variantSuccess,
    });
  };
  const enqueueInfoSnackbar = (message: string) => {
    enqueueSnackbar(<Typography>{message}</Typography>, {
      variant: "info",
      className: classes.variantInfo,
    });
  };
  const enqueueWarningSnackbar = (message: string) => {
    enqueueSnackbar(<Typography>{message}</Typography>, {
      variant: "warning",
      className: classes.variantWarning,
    });
  };
  const enqueueErrorSnackbar = (message: string) => {
    enqueueSnackbar(<Typography>{message}</Typography>, {
      variant: "error",
      className: classes.variantError,
    });
  };

  return {
    enqueueSuccessSnackbar,
    enqueueInfoSnackbar,
    enqueueWarningSnackbar,
    enqueueErrorSnackbar,
  };
};

/** Interface defining props for SnackbarProvider */
export interface SnackbarProviderProps
  extends Omit<
    NotistackSnackbarProviderProps,
    | "classes"
    | "anchorOrigin"
    | "maxSnack"
    | "dense"
    | "hideIconVariant"
    | "TransitionComponent"
    | "transitionDuration"
    | "autoHideDuration"
  > {}

/** Custom implementation of NotistackSnackbarProvider */
const SnackbarProvider = ({ children, ...rest }: SnackbarProviderProps) => {
  const classes = useStyles();

  return (
    <NotistackSnackbarProvider
      anchorOrigin={{ horizontal: "center", vertical: "top" }}
      classes={classes}
      maxSnack={3}
      dense
      iconVariant={{
        error: <Error />,
        success: <Check />,
        warning: <Warning />,
        info: <Info />,
      }}
      autoHideDuration={3000}
      {...rest}
    >
      {children}
    </NotistackSnackbarProvider>
  );
};

export default SnackbarProvider;
