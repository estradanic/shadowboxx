import React, { ForwardedRef, forwardRef } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import StarIcon from "@material-ui/icons/Star";
import Icon, { IconProps } from "@material-ui/core/Icon";
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
    ImageDecorationProps<IconProps>,
    "Component" | "description" | "corner" | "ComponentProps"
  > {
  corner?: ImageDecorationProps<IconProps>["corner"];
  checked: boolean;
  IconProps?: IconProps;
}

const CoverImageDecorationIcon = forwardRef(
  (props: IconProps, ref: ForwardedRef<any>) => (
    <Icon {...props} ref={ref}>
      <StarIcon />
    </Icon>
  )
);

const CoverImageDecoration = ({
  checked,
  corner = "bottomRight",
  IconProps = {},
  className: piClassName,
  ...rest
}: CoverImageDecorationProps) => {
  const classes = useStyles();

  return (
    <ImageDecoration<IconProps>
      corner={corner}
      Component={CoverImageDecorationIcon}
      description={
        checked ? Strings.unsetCoverImage() : Strings.setImageAsCover()
      }
      className={classNames(classes.root, piClassName, {
        [classes.checked]: checked,
        [classes.unchecked]: !checked,
      })}
      ComponentProps={{
        fontSize: "large",
        ...IconProps,
      }}
      {...rest}
    />
  );
};

export default CoverImageDecoration;
