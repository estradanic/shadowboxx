import React, {
  ForwardRefExoticComponent,
  MouseEventHandler,
  ReactNode,
} from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import classNames from "classnames";
import Tooltip from "../../Tooltip/Tooltip";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: "absolute",
    cursor: "pointer",
    zIndex: theme.zIndex.mobileStepper,
    "& > svg": {
      height: "100%",
    },
  },
  top: {
    top: theme.spacing(0),
  },
  right: {
    right: theme.spacing(0),
  },
  left: {
    left: theme.spacing(0),
  },
  bottom: {
    bottom: theme.spacing(0),
  },
}));

export interface ImageDecorationProps<P> {
  /** Component to render as the decoration */
  Component: ForwardRefExoticComponent<P>;
  /** Props to pass down to the rendered component */
  ComponentProps: P;
  /** Which corner of the image to render the decoration */
  corner: "topLeft" | "bottomLeft" | "topRight" | "bottomRight";
  /** Description to show in a tooltip */
  description?: string;
  /** Class name to apply to the root element */
  className?: string;
  /** Children to render */
  children?: ReactNode;
  /** Callback fired when the decoration is clicked */
  onClick?: MouseEventHandler;
}

/** Component to render a functional "decoration" on a corner of an image */
const ImageDecoration = <P,>({
  Component,
  ComponentProps,
  corner,
  description,
  className: piClassName,
  children,
  ...rest
}: ImageDecorationProps<P>) => {
  const classes = useStyles();
  const cornerClasses = [];
  if (corner.includes("top")) {
    cornerClasses.push(classes.top);
  } else {
    cornerClasses.push(classes.bottom);
  }
  if (corner.includes("Right")) {
    cornerClasses.push(classes.right);
  } else {
    cornerClasses.push(classes.left);
  }
  const className = classNames(...cornerClasses, classes.root, piClassName);

  return description ? (
    <Tooltip title={description}>
      <Component {...rest} {...ComponentProps} className={className}>
        {children}
      </Component>
    </Tooltip>
  ) : (
    <Component {...rest} {...ComponentProps} className={className}>
      {children}
    </Component>
  );
};

export default ImageDecoration;
