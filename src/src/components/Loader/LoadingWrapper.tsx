import React, { ReactNode } from "react";
import { CircularProgress, CircularProgressProps } from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import classNames from "classnames";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: "block",
    position: "relative",
    backgroundColor: ({ backgroundColor }) =>
      backgroundColor ?? theme.palette.background.default,
  },
  wrapper: {
    pointerEvents: ({ loading }: any) => (loading ? "none" : "auto"),
    opacity: ({ loading }: any) => (loading ? 0.3 : 1),
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
    color: theme.palette.error.light,
    margin: "auto",
  },
}));

/** Interface defining props for LoadingWrapper */
export interface LoadingWrapperProps extends CircularProgressProps {
  /** Whether to display the LoadingWrapper or not */
  loading?: boolean;
  /** Content to display under the loader */
  content?: ReactNode;
  /** React node that the LoadingWrapper wraps */
  children?: ReactNode;
  /** Background color for the overlay */
  backgroundColor?: string;
}

/** Component to disable input on elements and show visual clues while they are loading */
const LoadingWrapper = ({
  loading = false,
  content,
  children,
  className,
  backgroundColor,
  ...rest
}: LoadingWrapperProps) => {
  const classes = useStyles({ loading, backgroundColor });

  return (
    <div className={classNames(classes.root, className)}>
      <div className={classes.wrapper}>{children}</div>
      {loading && (
        <div className={classes.loader}>
          <CircularProgress
            disableShrink
            className={classes.spinner}
            {...rest}
          />
          {content}
        </div>
      )}
    </div>
  );
};

export default LoadingWrapper;
