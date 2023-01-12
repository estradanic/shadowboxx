import React from "react";
import UserAvatar, { UserAvatarProps } from "../../User/UserAvatar";
import ImageDecoration, { ImageDecorationProps } from "./ImageDecoration";

export interface OwnerImageDecorationProps
  extends Omit<
    ImageDecorationProps<UserAvatarProps>,
    "Component" | "description" | "corner" | "ComponentProps"
  > {
  corner?: ImageDecorationProps<UserAvatarProps>["corner"];
  UserAvatarProps: UserAvatarProps;
}

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
