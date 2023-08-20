import React from "react";
import MuiIconButton, {
  IconButtonProps as MuiIconButtonProps,
} from "@material-ui/core/IconButton";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { VariableColor } from "../../types";

type UseStylesParams = {
  color: VariableColor;
  contrastText: boolean;
};

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    color: ({ color, contrastText }: UseStylesParams) =>
      theme.palette[color][contrastText ? "contrastText" : "main"],
  },
}));

export interface IconButtonProps extends Omit<MuiIconButtonProps, "color"> {
  /** Color of the button */
  color?: VariableColor;
  /** Whether to use the contrast text color */
  contrastText?: boolean;
}

/** Button to wrap an icon */
const IconButton = ({
  color = "primary",
  contrastText = true,
  ...rest
}: IconButtonProps) => {
  const classes = useStyles({ color, contrastText });
  return <MuiIconButton classes={classes} {...rest} />;
};

export default IconButton;
