import React from "react";
import UserAvatar, { UserAvatarProps } from "../../User/UserAvatar";
import ImageDecoration, { ImageDecorationProps } from "./ImageDecoration";

export interface OwnerImageDecorationProps
  extends Omit<
    ImageDecorationProps<UserAvatarProps>,
    "Component" | "description" | "position" | "ComponentProps"
  > {
  /** Which position of the image to render the decoration */
  position?: ImageDecorationProps<UserAvatarProps>["position"];
  /** Props to pass down to the UserAvatar component */
  UserAvatarProps: UserAvatarProps;
}

/** Image decoration to display the profile picture of the owner of the image */
const OwnerImageDecoration = ({
  position = "bottomRight",
  UserAvatarProps,
  ...rest
}: OwnerImageDecorationProps) => {
  return (
    <ImageDecoration
      ComponentProps={UserAvatarProps}
      position={position}
      Component={UserAvatar}
      {...rest}
    />
  );
};

export default OwnerImageDecoration;
