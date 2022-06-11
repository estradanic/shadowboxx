import React from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import ImageDecoration, { ImageDecorationProps } from "./ImageDecoration";
import { Star } from "@material-ui/icons";
import Strings from "../../../resources/Strings";
import classNames from "classnames";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.primary.dark,
    borderRadius: "100%",
    border: `2px solid ${theme.palette.primary.contrastText}`,
  },
  checked: {
    color: theme.palette.warning.light,
  },
  unchecked: {
    color: theme.palette.primary.contrastText,
  },
}));

export interface CoverImageDecorationProps
  extends Omit<
    ImageDecorationProps,
    "IconComponent" | "description" | "corner"
  > {
  corner?: ImageDecorationProps["corner"];
  checked: boolean;
}

const CoverImageDecoration = ({
  checked,
  corner = "bottomRight",
  className: userClassName,
  ...rest
}: CoverImageDecorationProps) => {
  const classes = useStyles();

  return (
    <ImageDecoration
      corner={corner}
      IconComponent={Star}
      description={
        checked ? Strings.unsetCoverImage() : Strings.setImageAsCover()
      }
      className={classNames(userClassName, classes.root, {
        [classes.checked]: checked,
        [classes.unchecked]: !checked,
      })}
      fontSize="large"
      {...rest}
    />
  );
};

export default CoverImageDecoration;
