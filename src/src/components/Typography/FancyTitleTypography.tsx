import React from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import FancyTypography from "./FancyTypography";
import classnames from "classnames";

const useStyles = makeStyles((theme: Theme) => ({
  corner: {
    position: "absolute",
    backgroundColor: theme.palette.background.default,
    width: theme.spacing(7),
    height: theme.spacing(7),
    borderRadius: "100%",
  },
  topLeft: {
    top: theme.spacing(-3.5),
    left: theme.spacing(-3.5),
  },
  topRight: {
    top: theme.spacing(-3.5),
    right: theme.spacing(-3.5),
  },
  bottomLeft: {
    bottom: theme.spacing(-3.5),
    left: theme.spacing(-3.5),
  },
  bottomRight: {
    bottom: theme.spacing(-3.5),
    right: theme.spacing(-3.5),
  },
  root: {
    backgroundColor: theme.palette.background.paper,
    outline: `2px dashed ${theme.palette.primary.dark}`,
    outlineOffset: theme.spacing(-1),
    padding: theme.spacing(4, 8),
    textAlign: "center",
    position: "relative",
    color: theme.palette.text.primary,
  },
}));

export interface FancyTitleTypographyProps {
  children: React.ReactNode;
}

const FancyTitleTypography = ({ children }: FancyTitleTypographyProps) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classnames(classes.topRight, classes.corner)} />
      <div className={classnames(classes.topLeft, classes.corner)} />
      <div className={classnames(classes.bottomRight, classes.corner)} />
      <div className={classnames(classes.bottomLeft, classes.corner)} />
      <FancyTypography variant="h2">{children}</FancyTypography>
    </div>
  );
};

export default FancyTitleTypography;
