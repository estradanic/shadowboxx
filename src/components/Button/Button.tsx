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
    border: ({ color, variant }: UseStylesParams) => {
      if (variant === "outlined") {
        return `1px solid ${theme.palette[color].main}`;
      }
      return "none";
    },
    color: ({ color, variant }: UseStylesParams) => {
      if (variant === "contained") {
        return theme.palette[color].contrastText;
      }
      return theme.palette[color].main;
    },
    "&[disabled]": {
      color: ({ color, variant }: UseStylesParams) => {
        if (variant === "contained") {
          return theme.palette[color].contrastText;
        }
        return theme.palette[color].dark;
      },
      backgroundColor: ({ color, variant }: UseStylesParams) => {
        if (variant === "contained") {
          return theme.palette[color].dark;
        }
        return "transparent";
      },
      border: ({ color, variant }: UseStylesParams) => {
        if (variant === "outlined") {
          return `1px solid ${theme.palette[color].dark}`;
        }
        return "none";
      },
      opacity: 0.7,
    },
    "&:hover,&:focus": {
      color: ({ color, variant }: UseStylesParams) => {
        if (variant === "contained") {
          return theme.palette[color].contrastText;
        }
        return theme.palette[color].light;
      },
      backgroundColor: ({ color, variant }: UseStylesParams) => {
        if (variant === "contained") {
          return theme.palette[color].light;
        }
        return "transparent";
      },
      border: ({ color, variant }: UseStylesParams) => {
        if (variant === "outlined") {
          return `1px solid ${theme.palette[color].light}`;
        }
        return "none";
      },
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
  /** The color of the button */
  color?: VariableColor;
  /** The variant of the button when disabled */
  disabledVariant?: MuiButtonProps["variant"];
}

/** Custom button component */
const Button = forwardRef(
  (
    {
      color = "primary",
      className: piClassName,
      disabled,
      variant: piVariant,
      disabledVariant,
      ...rest
    }: ButtonProps,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    const variant = disabled && disabledVariant ? disabledVariant : piVariant;

    const classes = useStyles({ color, variant });
    const className = classNames(piClassName, classes.root);

    return (
      <MuiButton
        variant={variant}
        ref={ref}
        className={className}
        disabled={disabled}
        {...rest}
      />
    );
  }
);

export default Button;
