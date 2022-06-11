import React from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import ImageDecoration, { ImageDecorationProps } from "./ImageDecoration";
import { Remove } from "@material-ui/icons";
import Strings from "../../../resources/Strings";
import classNames from "classnames";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    borderRadius: "100%",
    border: `2px solid ${theme.palette.error.contrastText}`,
  },
}));

export interface RemoveImageDecorationProps
  extends Omit<
    ImageDecorationProps,
    "IconComponent" | "description" | "corner"
  > {
  corner?: ImageDecorationProps["corner"];
}

const RemoveImageDecoration = ({
  corner = "topLeft",
  className: userClassName,
  ...rest
}: RemoveImageDecorationProps) => {
  const classes = useStyles();

  return (
    <ImageDecoration
      corner={corner}
      IconComponent={Remove}
      description={Strings.removeImage()}
      fontSize="large"
      className={classNames(classes.root, userClassName)}
      {...rest}
    />
  );
};

export default RemoveImageDecoration;
