import React, { ForwardedRef, forwardRef } from "react";
import Avatar, { AvatarProps } from "@material-ui/core/Avatar";
import { makeStyles, Theme } from "@material-ui/core/styles";
import cx from "classnames";
import { useQuery } from "@tanstack/react-query";
import { Strings } from "../../resources";
import Tooltip from "../Tooltip/Tooltip";
import useQueryConfigs from "../../hooks/Query/useQueryConfigs";
import useUserInfo, { UseUserInfoParams } from "../../hooks/useUserInfo";

const useStyles = makeStyles((theme: Theme) => ({
  avatar: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.error.contrastText,
    cursor: "pointer",
    border: `2px solid ${theme.palette.primary.main}`,
  },
}));

/** Interface defining props for UserAvatar */
export interface UserAvatarProps
  extends Omit<AvatarProps, "title" | "alt" | "src"> {
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
    const { getImageUrlFunction, getImageUrlOptions, getImageUrlQueryKey } =
      useQueryConfigs();
    const user = useUserInfo(UseUserInfoParams);
    const { data: thumbUrl } = useQuery<string, Error>(
      getImageUrlQueryKey(user?.profilePicture?.id ?? "", "thumb"),
      () => getImageUrlFunction(user?.profilePicture?.id ?? "", "thumb"),
      getImageUrlOptions({ enabled: !!user?.profilePicture?.id })
    );
    const userName =
      user?.name ??
      UseUserInfoParams.email ??
      UseUserInfoParams.user?.name ??
      Strings.label.profilePicture;

    return (
      <Tooltip ref={ref} title={userName}>
        <div>
          <Avatar
            {...rest}
            className={cx(classes.avatar, piClassName)}
            src={thumbUrl}
            alt={userName}
          />
        </div>
      </Tooltip>
    );
  }
);

export default UserAvatar;
