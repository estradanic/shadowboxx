import React, { ReactNode } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import classNames from "classnames";
import { opacity } from "../../utils";
import LinearProgress, {
  LinearProgressProps,
} from "../Progress/LinearProgress";
import CircularProgress, {
  CircularProgressProps,
} from "../Progress/CircularProgress";
import useRandomColor from "../../hooks/useRandomColor";

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    pointerEvents: ({ loading }: any) => (loading ? "none" : "auto"),
  },
  globalLoaderWrapper: {
    width: "100vw",
    height: "100vh",
  },
  loaderWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: ({ backgroundColor }) =>
      opacity(backgroundColor ?? theme.palette.background.default, 0.7),
    zIndex: theme.zIndex.snackbar,
  },
  globalLoader: {
    left: "25vw",
    right: "25vw",
    width: "50vw",
  },
  loader: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  centerPositionLoader: {
    top: `calc(50% - 16rem)`,
  },
  topPositionLoader: {
    top: theme.spacing(1),
  },
  spinner: {
    margin: "auto",
    marginBottom: theme.spacing(2),
    height: theme.spacing(5),
  },
  progress: {
    marginBottom: theme.spacing(4.5),
  },
}));

/** Interface defining props for LoadingWrapper */
export interface LoadingWrapperProps
  extends Omit<CircularProgressProps, "variant" | "classes">,
    Omit<LinearProgressProps, "variant" | "classes" | "value"> {
  /** Whether the wrapper should cover the whole screen */
  global?: boolean;
  /** Whether to display the LoadingWrapper */
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

/** Component to show a loading overlay over elements */
const LoadingWrapper = ({
  loading = false,
  content,
  children,
  className,
  backgroundColor,
  verticalPosition = "center",
  type = "indeterminate",
  progress,
  global = true,
  ...rest
}: LoadingWrapperProps) => {
  const classes = useStyles({ loading, backgroundColor });
  const variableColor = useRandomColor();

  return (
    <div className={className}>
      <div className={classes.wrapper}>{children}</div>
      {loading && (
        <div className={classNames(classes.loaderWrapper, {[classes.globalLoaderWrapper]: global})}>
          <div
            className={classNames(classes.loader, {
              [classes.topPositionLoader]: verticalPosition === "top",
              [classes.centerPositionLoader]: verticalPosition === "center",
              [classes.globalLoader]: global,
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
                color={variableColor}
                variant="determinate"
                value={progress}
                className={classes.progress}
              />
            )}
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingWrapper;
