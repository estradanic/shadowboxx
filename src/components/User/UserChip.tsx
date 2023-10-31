import React from "react";
import UserLabel from "./UserLabel";
import UserAvatar from "./UserAvatar";
import Chip, { ChipProps } from "../../components/Chip/Chip";
import { UseUserInfoParams } from "../../hooks/useUserInfo";

/** Interface defining props for UserChip */
export interface UserChipProps
  extends Omit<ChipProps, "label" | "icon" | "component" | "classes"> {
  /** Params to be passed into useUserInfo */
  UseUserInfoParams: UseUserInfoParams;
}

/** Component to display the name and profile picture of a user */
const UserChip = ({ UseUserInfoParams, ...rest }: UserChipProps) => {
  return (
    <Chip
      {...rest}
      icon={<UserAvatar UseUserInfoParams={UseUserInfoParams} />}
      label={<UserLabel UseUserInfoParams={UseUserInfoParams} />}
    />
  );
};

export default UserChip;
