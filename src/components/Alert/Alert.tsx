import React, {forwardRef} from "react";
import {Alert as MatAlert, AlertProps as MatAlertProps} from "@material-ui/lab";
import {makeStyles, Theme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    bottom: theme.spacing(10),
  },
  filledSuccess: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  },
  filledInfo: {
    backgroundColor: theme.palette.info.main,
    color: theme.palette.info.contrastText,
  },
  filledWarning: {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
  },
  filledError: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
}));

export interface AlertProps
  extends Omit<MatAlertProps, "variant" | "classes"> {}

const Alert = forwardRef(({children, ...rest}: AlertProps, ref) => {
  const classes = useStyles();

  return (
    <MatAlert ref={ref} variant="filled" classes={classes} {...rest}>
      {children}
    </MatAlert>
  );
});

export default Alert;
