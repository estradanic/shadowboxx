import React, { ReactNode } from "react";
import {
  CircularProgress,
  CircularProgressProps,
  LinearProgress,
  LinearProgressProps,
} from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import classNames from "classnames";

// TODO: Fix zIndeces
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    zIndex: 1399,
    display: "block",
    position: "relative",
    backgroundColor: ({ backgroundColor }) =>
      backgroundColor ?? theme.palette.background.default,
  },
  wrapper: {
    zIndex: 1399,
    pointerEvents: ({ loading }: any) => (loading ? "none" : "auto"),
    opacity: ({ loading }: any) => (loading ? 0.3 : 1),
  },
  loader: {
    position: "absolute",
    zIndex: 1400,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  centerPositionLoader: {
    top: "calc(50% - 20px)",
  },
  topPositionLoader: {
    top: theme.spacing(1),
  },
  indeterminateLoader: {
    left: "calc(50% - 20px)",
  },
  determinateLoader: {
    left: "25vw",
    right: "25vw",
    width: "50vw",
  },
  spinner: {
    color: theme.palette.error.light,
    margin: "auto",
  },
  progress: {
    color: theme.palette.error.light,
    width: "100%",
  },
}));

/** Interface defining props for LoadingWrapper */
export interface LoadingWrapperProps
  extends Omit<CircularProgressProps, "variant" | "color" | "classes">,
    Omit<LinearProgressProps, "variant" | "color" | "classes" | "value"> {
  /** Whether to display the LoadingWrapper or not */
  loading?: boolean;
  /** Content to display under the loader */
  content?: ReactNode;
  /** React node that the LoadingWrapper wraps */
  children?: ReactNode;
  /** Background color for the overlay */
  backgroundColor?: string;
  /** Where vertically to position the spinner */
  verticalPosition?: "center" | "top";
  /** Type of loader to show */
  type?: "determinate" | "indeterminate";
  /** Progress to show in a determinate type loader */
  progress?: LinearProgressProps["value"];
}

/** Component to disable input on elements and show visual clues while they are loading */
const LoadingWrapper = ({
  loading = false,
  content,
  children,
  className,
  backgroundColor,
  verticalPosition = "center",
  type = "indeterminate",
  progress,
  ...rest
}: LoadingWrapperProps) => {
  const classes = useStyles({ loading, backgroundColor });

  return (
    <div className={classNames(classes.root, className)}>
      <div className={classes.wrapper}>{children}</div>
      {loading && (
        <div
          className={classNames({
            [classes.loader]: true,
            [classes.topPositionLoader]: verticalPosition === "top",
            [classes.centerPositionLoader]: verticalPosition === "center",
            [classes.indeterminateLoader]: type === "indeterminate",
            [classes.determinateLoader]: type === "determinate",
          })}
        >
          {type === "indeterminate" ? (
            <CircularProgress
              disableShrink
              className={classes.spinner}
              {...rest}
            />
          ) : (
            <LinearProgress
              variant="determinate"
              value={progress}
              className={classes.progress}
            />
          )}
          {content}
        </div>
      )}
    </div>
  );
};

export default LoadingWrapper;
