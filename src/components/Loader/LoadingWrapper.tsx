import React, {ReactNode} from "react";
import {CircularProgress, CircularProgressProps} from "@material-ui/core";
import {makeStyles, Theme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: "block",
    position: "relative",
    backgroundColor: theme.palette.background.default,
  },
  wrapper: {
    pointerEvents: ({loading}: any) => (loading ? "none" : "auto"),
    opacity: ({loading}: any) => (loading ? 0.3 : 1),
  },
  loader: {
    position: "absolute",
    zIndex: 100,
    top: "30%",
    left: "calc(50% - 20px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    color: theme.palette.error.main,
    margin: "auto",
  },
}));

export interface LoadingWrapperProps extends CircularProgressProps {
  loading?: boolean;
  content?: ReactNode;
  children?: ReactNode;
}

const LoadingWrapper = ({
  loading = false,
  content,
  children,
  ...rest
}: LoadingWrapperProps) => {
  const classes = useStyles({loading});

  return (
    <div className={classes.root}>
      <div className={classes.wrapper}>{children}</div>
      {loading && (
        <div className={classes.loader}>
          <CircularProgress className={classes.spinner} {...rest} />
          {content}
        </div>
      )}
    </div>
  );
};

export default LoadingWrapper;
