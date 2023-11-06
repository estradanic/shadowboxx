import React, { ReactNode } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import FancyTypography from "./FancyTypography";
import classNames from "classnames";
import { VariableColor } from "../../types";

interface UseStylesParams {
  outlineColor: VariableColor;
}

export const useStyles = makeStyles((theme: Theme) => ({
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
    outline: ({ outlineColor }: UseStylesParams) =>
      `2px dashed ${theme.palette[outlineColor].dark}`,
    outlineOffset: theme.spacing(-1),
    padding: theme.spacing(3, 3),
    textAlign: "center",
    position: "relative",
    color: theme.palette.text.primary,
    margin: 0,
  },
}));

export interface FancyTitleTypographyProps {
  /** The color of the outline */
  outlineColor?: VariableColor;
  /** The text to display */
  children: ReactNode;
}

/** A component to display a fancy title */
const FancyTitleTypography = ({
  children,
  outlineColor = "primary",
}: FancyTitleTypographyProps) => {
  const classes = useStyles({ outlineColor });

  return (
    <div className={classes.root}>
      <div className={classNames(classes.topRight, classes.corner)} />
      <div className={classNames(classes.topLeft, classes.corner)} />
      <div className={classNames(classes.bottomRight, classes.corner)} />
      <div className={classNames(classes.bottomLeft, classes.corner)} />
      <div
        className={classNames(classes.top, classes.edge, classes.topBottom)}
      />
      <div
        className={classNames(classes.left, classes.edge, classes.leftRight)}
      />
      <div
        className={classNames(classes.bottom, classes.edge, classes.topBottom)}
      />
      <div
        className={classNames(classes.right, classes.edge, classes.leftRight)}
      />
      <FancyTypography variant="h2">{children}</FancyTypography>
    </div>
  );
};

export default FancyTitleTypography;
