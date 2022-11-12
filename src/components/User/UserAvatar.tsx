import React, { ForwardedRef, forwardRef } from "react";
import Avatar, { AvatarProps } from "@material-ui/core/Avatar";
import { makeStyles, Theme } from "@material-ui/core/styles";
import cx from "classnames";
import { useQuery } from "@tanstack/react-query";
import { ParseImage } from "../../classes";
import { Strings } from "../../resources";
import { useQueryConfigs, useUserInfo, UseUserInfoParams } from "../../hooks";
import Tooltip from "../Tooltip/Tooltip";

const useStyles = makeStyles((theme: Theme) => ({
  avatar: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.error.contrastText,
    cursor: "pointer",
  },
}));

/** Interface defining props for UserAvatar */
export interface UserAvatarProps extends AvatarProps {
  /** Params to be passed into useUserInfo */
  UseUserInfoParams: UseUserInfoParams;
}

/** Component to display the profile picture of a user */
const UserAvatar = forwardRef(
  (
    {
      UseUserInfoParams,
      className: piClassName = "",
      ...rest
    }: UserAvatarProps,
    ref: ForwardedRef<any>
  ) => {
    const classes = useStyles();
    const { getImageByIdFunction, getImageByIdQueryKey, getImageByIdOptions } =
      useQueryConfigs();
    const user = useUserInfo(UseUserInfoParams);
    const { data: profilePicture } = useQuery<ParseImage, Error>(
      getImageByIdQueryKey(user?.profilePicture?.id ?? ""),
      () => getImageByIdFunction(user?.profilePicture?.id ?? ""),
      getImageByIdOptions({ enabled: !!user?.profilePicture?.id })
    );
    const userName =
      user?.name ??
      UseUserInfoParams.email ??
      UseUserInfoParams.user?.name ??
      "";

    return (
      <Tooltip title={userName}>
        <Avatar
          ref={ref}
          alt={user?.name ?? Strings.profilePicture()}
          className={cx(classes.avatar, piClassName)}
          src={profilePicture?.fileThumb?.url()}
          {...rest}
        />
      </Tooltip>
    );
  }
);

export default UserAvatar;
