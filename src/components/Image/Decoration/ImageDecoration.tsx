import React from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { SvgIconProps, SvgIconTypeMap } from "@material-ui/core/SvgIcon";
import { OverridableComponent } from "@material-ui/core/OverridableComponent";
import classNames from "classnames";
import Tooltip from "../../Tooltip/Tooltip";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: "absolute",
    cursor: "pointer",
    zIndex: theme.zIndex.tooltip,
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

export interface ImageDecorationProps extends SvgIconProps {
  IconComponent: OverridableComponent<SvgIconTypeMap>;
  corner: "topLeft" | "bottomLeft" | "topRight" | "bottomRight";
  description: string;
}

const ImageDecoration = ({
  IconComponent,
  corner,
  description,
  children,
  className: userClassName,
  ...rest
}: ImageDecorationProps) => {
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
  const className = classNames(...cornerClasses, userClassName, classes.root);

  return (
    <Tooltip title={description}>
      <IconComponent className={className} {...rest}>
        {children}
      </IconComponent>
    </Tooltip>
  );
};

export default ImageDecoration;
