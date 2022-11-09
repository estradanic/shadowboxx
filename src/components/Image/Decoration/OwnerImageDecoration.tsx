import React from "react";
import { ParseUser } from "../../../classes";
import UserAvatar, { UserAvatarProps } from "../../User/UserAvatar";
import ImageDecoration, { ImageDecorationProps } from "./ImageDecoration";

export interface OwnerImageDecorationProps
  extends Omit<
    ImageDecorationProps<UserAvatarProps>,
    "Component" | "description" | "corner" | "ComponentProps"
  > {
  corner?: ImageDecorationProps<UserAvatarProps>["corner"];
  owner: ParseUser;
  UserAvatarProps?: UserAvatarProps;
}

const OwnerImageDecoration = ({
  owner,
  corner = "bottomRight",
  UserAvatarProps,
  ...rest
}: OwnerImageDecorationProps) => {
  return (
    <ImageDecoration
      ComponentProps={{
        fetchUser: () => owner,
        email: owner.email,
        ...(UserAvatarProps ?? {}),
      }}
      corner={corner}
      Component={UserAvatar}
      description={owner.name}
      {...rest}
    />
  );
};

export default OwnerImageDecoration;
