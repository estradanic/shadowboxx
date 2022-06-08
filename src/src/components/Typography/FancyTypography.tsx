import React from "react";
import { Typography, TypographyProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import classnames from "classnames";

const useStyles = makeStyles(() => ({
  root: {
    fontFamily: "Alex Brush",
  },
}));

export interface FancyTypographyProps extends TypographyProps {}

const FancyTypography = ({
  className,
  children,
  ...rest
}: FancyTypographyProps) => {
  const classes = useStyles();

  return (
    <Typography {...rest} className={classnames(className, classes.root)}>
      {children}
    </Typography>
  );
};

export default FancyTypography;
