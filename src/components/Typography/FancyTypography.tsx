import React from "react";
import Typography, { TypographyProps } from "@material-ui/core/Typography";
import { makeStyles, Theme } from "@material-ui/core/styles";
import classNames from "classnames";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    fontFamily: "Alex Brush",
  },
  loading: {
    color: theme.palette.primary.contrastText,
    fontSize: theme.typography.h3.fontSize,
  },
}));

export interface FancyTypographyProps extends Omit<TypographyProps, "variant"> {
  /** The variant of the text to display */
  variant?: "loading" | TypographyProps["variant"];
}

/** A component to display some fancy text */
const FancyTypography = ({
  className,
  children,
  variant,
  ...rest
}: FancyTypographyProps) => {
  const classes = useStyles();
  const typographyVariant = variant === "loading" ? undefined : variant;

  return (
    <Typography
      variant={typographyVariant}
      {...rest}
      className={classNames(className, classes.root, {
        [classes.loading]: variant === "loading",
      })}
    >
      {children}
    </Typography>
  );
};

export default FancyTypography;
