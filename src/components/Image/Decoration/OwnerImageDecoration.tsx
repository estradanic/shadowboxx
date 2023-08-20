import React from "react";
import UserAvatar, { UserAvatarProps } from "../../User/UserAvatar";
import ImageDecoration, { ImageDecorationProps } from "./ImageDecoration";

export interface OwnerImageDecorationProps
  extends Omit<
    ImageDecorationProps<UserAvatarProps>,
    "Component" | "description" | "corner" | "ComponentProps"
  > {
  /** Which corner of the image to render the decoration */
  corner?: ImageDecorationProps<UserAvatarProps>["corner"];
  /** Props to pass down to the UserAvatar component */
  UserAvatarProps: UserAvatarProps;
}

/** Image decoration to display the profile picture of the owner of the image */
const OwnerImageDecoration = ({
  corner = "bottomRight",
  UserAvatarProps,
  ...rest
}: OwnerImageDecorationProps) => {
  return (
    <ImageDecoration
      ComponentProps={UserAvatarProps}
      corner={corner}
      Component={UserAvatar}
      {...rest}
    />
  );
};

export default OwnerImageDecoration;
