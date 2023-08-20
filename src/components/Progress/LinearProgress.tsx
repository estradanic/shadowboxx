import React from "react";
import MuiLinearProgress, {
  LinearProgressProps as MuiLinearProgressProps,
} from "@material-ui/core/LinearProgress";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { VariableColor } from "../../types";

type UseStylesProps = { color: VariableColor };

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: "100%",
  },
  bar: {
    backgroundColor: ({ color }: UseStylesProps) => theme.palette[color].main,
  },
  bar1Indeterminate: {
    width: "auto",
    animation: "$indeterminate1 2s linear infinite",
  },
  bar2Indeterminate: {
    display: "none",
  },
  "@keyframes indeterminate1": {
    "0%": {
      left: "-35%",
      right: "100%",
    },
    "50%": {
      right: "-35%",
      left: "100%",
    },
    "100%": {
      left: "-35%",
      right: "100%",
    },
  },
}));

export interface LinearProgressProps
  extends Omit<MuiLinearProgressProps, "color"> {
  /** The color of the progress bar */
  color?: VariableColor;
}

/** A component to display a linear progress bar */
const LinearProgress = ({
  color = "primary",
  ...rest
}: LinearProgressProps) => {
  const classes = useStyles({ color });
  return <MuiLinearProgress classes={classes} {...rest} />;
};

export default LinearProgress;
