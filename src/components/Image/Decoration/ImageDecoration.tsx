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
    zIndex: theme.zIndex.tooltip,
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
  Component: ForwardRefExoticComponent<P>;
  ComponentProps: P;
  corner: "topLeft" | "bottomLeft" | "topRight" | "bottomRight";
  description?: string;
  className?: string;
  children?: ReactNode;
  onClick?: MouseEventHandler;
}

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
