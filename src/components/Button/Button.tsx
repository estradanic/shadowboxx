import React, { forwardRef, ForwardedRef } from "react";
import MuiButton, {
  ButtonProps as MuiButtonProps,
} from "@material-ui/core/Button";
import { VariableColor } from "../../types";
import classNames from "classnames";
import { makeStyles, Theme } from "@material-ui/core/styles";

type UseStylesParams = {
  color: VariableColor;
  variant: MuiButtonProps["variant"];
};

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    color: ({ color, variant }: UseStylesParams) => {
      if (variant === "contained") {
        return theme.palette[color].contrastText;
      }
      return theme.palette[color].main;
    },
    backgroundColor: ({ color, variant }: UseStylesParams) => {
      if (variant === "contained") {
        return theme.palette[color].main;
      }
      return "transparent";
    },
  },
}));

export interface ButtonProps extends Omit<MuiButtonProps, "color"> {
  color?: VariableColor;
}

const Button = forwardRef(
  (
    { color = "primary", className: piClassName, ...rest }: ButtonProps,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    const classes = useStyles({ color, variant: rest.variant });
    const className = classNames(piClassName, classes.root);

    return <MuiButton ref={ref} className={className} {...rest} />;
  }
);

export default Button;
