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
    transform: "rotate(45deg)",
    zIndex: 10,
  },
  topLeft: {
    top: theme.spacing(-3.5),
    left: theme.spacing(-3.5),
    borderRight: `2px solid ${theme.palette.primary.dark}`,
  },
  topRight: {
    top: theme.spacing(-3.5),
    right: theme.spacing(-3.5),
    borderBottom: `2px solid ${theme.palette.primary.dark}`,
  },
  bottomLeft: {
    bottom: theme.spacing(-3.5),
    left: theme.spacing(-3.5),
    borderTop: `2px solid ${theme.palette.primary.dark}`,
  },
  bottomRight: {
    bottom: theme.spacing(-3.5),
    right: theme.spacing(-3.5),
    borderLeft: `2px solid ${theme.palette.primary.dark}`,
  },
  edge: {
    position: "absolute",
    backgroundColor: theme.palette.background.default,
    zIndex: 20,
  },
  topBottom: {
    left: 0,
    height: theme.spacing(3.5),
    width: "100%",
  },
  leftRight: {
    top: 0,
    width: theme.spacing(3.5),
    height: "100%",
  },
  top: {
    top: theme.spacing(-3.75),
  },
  bottom: {
    bottom: theme.spacing(-3.75),
  },
  left: {
    left: theme.spacing(-3.75),
  },
  right: {
    right: theme.spacing(-3.75),
  },
  root: {
    backgroundColor: theme.palette.background.paper,
    border: `2px solid ${theme.palette.primary.dark}`,
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
      <div
        className={classnames(classes.top, classes.edge, classes.topBottom)}
      />
      <div
        className={classnames(classes.left, classes.edge, classes.leftRight)}
      />
      <div
        className={classnames(classes.bottom, classes.edge, classes.topBottom)}
      />
      <div
        className={classnames(classes.right, classes.edge, classes.leftRight)}
      />
      <FancyTypography variant="h2">{children}</FancyTypography>
    </div>
  );
};

export default FancyTitleTypography;
