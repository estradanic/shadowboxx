import React from "react";
import {
  OptionsObject,
  SnackbarProvider as NotistackSnackbarProvider,
  SnackbarProviderProps as NotistackSnackbarProviderProps,
  useSnackbar as notistackUseSnackbar,
} from "notistack";
import { makeStyles, Theme } from "@material-ui/core/styles";
import ErrorIcon from "@material-ui/icons/Error";
import CheckIcon from "@material-ui/icons/Check";
import WarningIcon from "@material-ui/icons/Warning";
import InfoIcon from "@material-ui/icons/Info";
import Typography from "@material-ui/core/Typography";

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
}));

/** Hook providing easy access to enqueuing different kinds of Snackbars */
export const useSnackbar = () => {
  const { enqueueSnackbar, closeSnackbar } = notistackUseSnackbar();
  const classes = useStyles();

  const enqueueSuccessSnackbar = (
    message: string,
    options: OptionsObject = {}
  ) => {
    return enqueueSnackbar(<Typography>{message}</Typography>, {
      className: classes.variantSuccess,
      preventDuplicate: true,
      ...options,
      variant: "success",
    });
  };
  const enqueueInfoSnackbar = (
    message: string,
    options: OptionsObject = {}
  ) => {
    return enqueueSnackbar(<Typography>{message}</Typography>, {
      className: classes.variantInfo,
      preventDuplicate: true,
      ...options,
      variant: "info",
    });
  };
  const enqueueWarningSnackbar = (
    message: string,
    options: OptionsObject = {}
  ) => {
    return enqueueSnackbar(<Typography>{message}</Typography>, {
      className: classes.variantWarning,
      preventDuplicate: true,
      ...options,
      variant: "warning",
    });
  };
  const enqueueErrorSnackbar = (
    message: string,
    options: OptionsObject = {}
  ) => {
    return enqueueSnackbar(<Typography>{message}</Typography>, {
      className: classes.variantError,
      preventDuplicate: true,
      ...options,
      variant: "error",
    });
  };

  return {
    enqueueSuccessSnackbar,
    enqueueInfoSnackbar,
    enqueueWarningSnackbar,
    enqueueErrorSnackbar,
    closeSnackbar,
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
        error: <ErrorIcon />,
        success: <CheckIcon />,
        warning: <WarningIcon />,
        info: <InfoIcon />,
      }}
      autoHideDuration={3000}
      {...rest}
    >
      {children}
    </NotistackSnackbarProvider>
  );
};

export default SnackbarProvider;
