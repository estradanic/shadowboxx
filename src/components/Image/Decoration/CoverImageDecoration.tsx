import React from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import StarIcon from "@material-ui/icons/Star";
import classNames from "classnames";
import { Strings } from "../../../resources";
import ImageDecoration, { ImageDecorationProps } from "./ImageDecoration";

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
      IconComponent={StarIcon}
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
