import React, { ForwardedRef } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import RemoveIcon from "@material-ui/icons/Remove";
import Icon, { IconProps } from "@material-ui/core/Icon";
import classNames from "classnames";
import { Strings } from "../../../resources";
import ImageDecoration, { ImageDecorationProps } from "./ImageDecoration";
import { forwardRef } from "react";

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
    ImageDecorationProps<IconProps>,
    "Component" | "description" | "corner" | "ComponentProps"
  > {
  /** Which corner of the image to render the decoration */
  corner?: ImageDecorationProps<IconProps>["corner"];
  /** Props to pass down to the icon */
  IconProps?: IconProps;
}

const RemoveImageDecorationIcon = forwardRef(
  (props: IconProps, ref: ForwardedRef<any>) => (
    <Icon {...props} ref={ref}>
      <RemoveIcon />
    </Icon>
  )
);

/** Image decoration component to remove the decorated image */
const RemoveImageDecoration = ({
  corner = "topLeft",
  className: userClassName,
  IconProps = {},
  ...rest
}: RemoveImageDecorationProps) => {
  const classes = useStyles();

  return (
    <ImageDecoration<IconProps>
      corner={corner}
      Component={RemoveImageDecorationIcon}
      description={Strings.action.removeImage}
      ComponentProps={{
        fontSize: "large",
        ...IconProps,
      }}
      className={classNames(classes.root, userClassName)}
      {...rest}
    />
  );
};

export default RemoveImageDecoration;
