import React from "react";
import MuiCircularProgress, {
  CircularProgressProps as MuiCircularProgressProps,
} from "@material-ui/core/CircularProgress";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { VariableColor } from "../../types";

type UseStylesProps = { color: VariableColor };

const useStyles = makeStyles((theme: Theme) => ({
  circle: {
    backgroundColor: ({ color }: UseStylesProps) => theme.palette[color].main,
  },
}));

export interface CircularProgressProps
  extends Omit<MuiCircularProgressProps, "color"> {
  color?: VariableColor;
}

const CircularProgress = ({
  color = "primary",
  ...rest
}: CircularProgressProps) => {
  const classes = useStyles({ color });
  return <MuiCircularProgress classes={classes} {...rest} />;
};

export default CircularProgress;
